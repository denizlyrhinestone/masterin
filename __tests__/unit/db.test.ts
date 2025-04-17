import { executeQuery, toCamelCase, toSnakeCase } from "../../lib/db"
import { jest, describe, beforeEach, it, expect } from "@jest/globals"

// Mock the neon module
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(() => ({
    query: jest.fn(),
  })),
  neonConfig: {
    fetchConnectionCache: true,
  },
}))

// Mock the logger
jest.mock("../../lib/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}))

describe("Database Module", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.DATABASE_URL = "postgres://user:password@host:5432/dbname"
  })

  describe("executeQuery", () => {
    it("should execute a query successfully", async () => {
      // Mock successful query
      const mockResult = [{ id: 1, name: "Test" }]
      const mockSql = require("@neondatabase/serverless").neon()
      mockSql.query.mockResolvedValueOnce(mockResult)

      const result = await executeQuery("SELECT * FROM test")

      expect(result).toEqual(mockResult)
      expect(mockSql.query).toHaveBeenCalledWith("SELECT * FROM test", [])
    })

    it("should handle query errors", async () => {
      // Mock failed query
      const mockError = new Error("Query failed")
      const mockSql = require("@neondatabase/serverless").neon()
      mockSql.query.mockRejectedValueOnce(mockError)

      const result = await executeQuery("SELECT * FROM test")

      expect(result).toEqual([])
      expect(require("../../lib/logger").logger.error).toHaveBeenCalled()
    })

    it("should retry on transient errors", async () => {
      // Mock transient error then success
      const mockError = new Error("connection error")
      const mockResult = [{ id: 1, name: "Test" }]
      const mockSql = require("@neondatabase/serverless").neon()
      mockSql.query.mockRejectedValueOnce(mockError).mockResolvedValueOnce(mockResult)

      const result = await executeQuery("SELECT * FROM test", [], { retryCount: 1 })

      expect(result).toEqual(mockResult)
      expect(mockSql.query).toHaveBeenCalledTimes(2)
    })

    it("should throw for critical queries when specified", async () => {
      // Mock failed query
      const mockError = new Error("Query failed")
      const mockSql = require("@neondatabase/serverless").neon()
      mockSql.query.mockRejectedValueOnce(mockError)

      await expect(executeQuery("SELECT * FROM test", [], { critical: true })).rejects.toThrow()
    })
  })

  describe("toCamelCase", () => {
    it("should convert snake_case to camelCase", () => {
      const input = { user_id: 1, first_name: "John", last_name: "Doe" }
      const expected = { userId: 1, firstName: "John", lastName: "Doe" }

      expect(toCamelCase(input)).toEqual(expected)
    })
  })

  describe("toSnakeCase", () => {
    it("should convert camelCase to snake_case", () => {
      expect(toSnakeCase("userId")).toBe("user_id")
      expect(toSnakeCase("firstName")).toBe("first_name")
    })
  })
})
