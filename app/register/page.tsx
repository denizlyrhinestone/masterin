"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

export default function RegisterPage() {
  const [step, setStep] = useState(1)

  const handleNextStep = () => {
    setStep(step + 1)
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Card className="w-full overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="hidden bg-gradient-to-br from-primary to-secondary p-12 text-white md:block">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Join Masterin</h2>
                  <p className="mt-2 text-primary-foreground/80">Your personalized learning journey starts here.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm">Personalized learning paths</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm">24/7 AI tutor assistance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm">Interactive lessons and quizzes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm">Progress tracking and analytics</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <Tabs defaultValue="register" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                </TabsList>

                <TabsContent value="register">
                  <div className="space-y-6">
                    {step === 1 && (
                      <>
                        <div className="space-y-4">
                          <CardHeader className="p-0">
                            <CardTitle>Create your account</CardTitle>
                            <CardDescription>Enter your information to get started</CardDescription>
                          </CardHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="first-name">First Name</Label>
                                <Input id="first-name" placeholder="John" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="last-name">Last Name</Label>
                                <Input id="last-name" placeholder="Doe" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" placeholder="john.doe@example.com" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <Input id="password" type="password" />
                            </div>
                          </div>
                        </div>

                        <Button className="w-full" onClick={handleNextStep}>
                          Continue <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <div className="space-y-4">
                          <CardHeader className="p-0">
                            <CardTitle>Educational Information</CardTitle>
                            <CardDescription>Help us personalize your learning experience</CardDescription>
                          </CardHeader>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="grade">Grade Level</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="6">6th Grade</SelectItem>
                                  <SelectItem value="7">7th Grade</SelectItem>
                                  <SelectItem value="8">8th Grade</SelectItem>
                                  <SelectItem value="9">9th Grade</SelectItem>
                                  <SelectItem value="10">10th Grade</SelectItem>
                                  <SelectItem value="11">11th Grade</SelectItem>
                                  <SelectItem value="12">12th Grade</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="interests">Areas of Interest</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your primary interest" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="biology">Biology</SelectItem>
                                  <SelectItem value="chemistry">Chemistry</SelectItem>
                                  <SelectItem value="physics">Physics</SelectItem>
                                  <SelectItem value="mathematics">Mathematics</SelectItem>
                                  <SelectItem value="history">History</SelectItem>
                                  <SelectItem value="literature">Literature</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="goals">Learning Goals</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your primary goal" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="improve-grades">Improve Grades</SelectItem>
                                  <SelectItem value="test-prep">Test Preparation</SelectItem>
                                  <SelectItem value="college-prep">College Preparation</SelectItem>
                                  <SelectItem value="advanced-learning">Advanced Learning</SelectItem>
                                  <SelectItem value="personal-interest">Personal Interest</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Button asChild className="w-full">
                          <Link href="/">
                            Complete Registration <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </>
                    )}

                    <div className="text-center text-sm text-muted-foreground">
                      By registering, you agree to our{" "}
                      <Link href="#" className="underline underline-offset-4 hover:text-primary">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="underline underline-offset-4 hover:text-primary">
                        Privacy Policy
                      </Link>
                      .
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="login">
                  <div className="space-y-4">
                    <CardHeader className="p-0">
                      <CardTitle>Welcome back</CardTitle>
                      <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" placeholder="john.doe@example.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" type="password" />
                      </div>

                      <div className="text-right text-sm">
                        <Link href="#" className="text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <Button asChild className="w-full">
                      <Link href="/">Login</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <CardFooter className="flex justify-center p-0 pt-4">
                <div className="text-center text-sm text-muted-foreground">
                  <span className="mx-2">Don't have an account?</span>
                  <Link href="#" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
