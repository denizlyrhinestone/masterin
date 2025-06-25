// __mocks__/fileMock.js

// This mock is used for static file imports (images, svgs, etc.) in Jest.
// When Jest encounters an import for a file type specified in moduleNameMapper
// (e.g., '\\.(gif|ttf|eot|svg|png)$'), it will use this stub instead.
module.exports = 'test-file-stub';
