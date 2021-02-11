var fs = require('fs')
var os = require('os')

// const insertLine = require('insert-line')
function Inserter(filePath) {
  if (typeof filePath === 'undefined') {
    throw new Error('File path not specified')
  }
  this.filePath = filePath
  return this
}

Inserter.prototype.content = function (lineContent, options) {
  return setUpContentInserter.bind(this)(lineContent, options, false)
}

Inserter.prototype.at = function (lineNumber) {
  if (!this.options.append) {
    lineNumber = parseInt(lineNumber)
    if (typeof lineNumber !== 'number' || lineNumber <= 0) {
      throw new Error('Invalid line number')
    }
  }
  this.atLineNumber = lineNumber
  return this.then()
}

Inserter.prototype.then = async function () {
    const that = this;

  return new Promise(function (resolve, reject) {
    if (
      typeof that.atLineNumber === 'undefined' &&
      !that.options.prepend &&
      !that.options.append
    ) {
      return reject(new Error('Line number not set'))
    }
    var filePath = that.filePath
    var self = that
    fs.access(filePath, function (err) {
      if (err) {
        return reject(err)
      }
      fs.readFile(filePath, 'utf8', function (err, fileContent) {
        if (err) {
          return reject(err)
        }
        insert(
          self.filePath,
          fileContent,
          self.atLineNumber,
          self.lineContent,
          self.options,
          resolve,
        )
      })
    })
  })
}

function setUpContentInserter(lineContent, options) {
  if (typeof lineContent === 'undefined') {
    lineContent = ''
  }
  this.options = {
    prepend: false,
    append: false,
  }
  if (typeof options !== 'undefined') {
    if ('prepend' in options) {
      this.options.prepend = options.prepend
    }
    if ('append' in options) {
      this.options.append = options.append
    }
  }
  this.lineContent = lineContent.toString()
  return this
}

function insert(
  filePath,
  fileContent,
  atLineNumber,
  lineContent,
  options,
  callback,
) {
  var prepend = false
  var append = false
  var newLines = []
  var updatedContent

  var lines = fileContent.split(/\r\n|\r|\n/g)
  const linesContent = lineContent.split(/\r\n|\r|\n/g)
  var nextLine = lines.length + 1

  if (atLineNumber > nextLine) {
    return callback(new Error('Invalid line'))
  }

  if (options.prepend || atLineNumber === 0) {
    prepend = true
  } else if (options.append || lines.length === atLineNumber + 1) {
    append = true
  }

  if (prepend) {
    updatedContent = linesContent.concat(lines)
  } else if (append) {
    updatedContent = lines.concat(linesContent)
  } else {
    updatedContent = lines.slice(0, atLineNumber)
    updatedContent = updatedContent
      .concat(linesContent)
      .concat(lines.slice(atLineNumber))
  }
  updatedContent = updatedContent.join('\n')

  fs.writeFile(filePath, updatedContent, function (err) {
    return callback(err)
  })
}

function Checker(filePath) {
  if (typeof filePath === 'undefined') {
    throw new Error('File path not specified')
  }
  this.filePath = filePath
  return this
}

Checker.prototype.content = function (lineContent, options) {
  return setUpContentChecker.bind(this)(lineContent, options, false)
}

Checker.prototype.at = function (lineNumber) {
  if (!this.options.append) {
    lineNumber = parseInt(lineNumber)
    if (typeof lineNumber !== 'number' || lineNumber <= 0) {
      throw new Error('Invalid line number')
    }
  }
  this.atLineNumber = lineNumber
  return this.then();
}

Checker.prototype.then = async function () {
  const that = this;
  return new Promise(function (resolve, reject) {
    if (
      typeof that.atLineNumber === 'undefined' &&
      !that.options.prepend &&
      !that.options.append
    ) {
      return reject(new Error('Line number not set'))
    }
    var filePath = that.filePath
    var self = that
    fs.access(filePath, function (err) {
      if (err) {
        return reject(err)
      }
      fs.readFile(filePath, 'utf8', function (err, fileContent) {
        if (err) {
          return reject(err)
        }
        check(
          self.filePath,
          fileContent,
          self.atLineNumber,
          self.lineContent,
          self.options,
          resolve,
        )
      })
    })
  })
}

function setUpContentChecker(lineContent, options) {
  if (typeof lineContent === 'undefined') {
    lineContent = ''
  }
  this.options = {
    prepend: false,
    append: false,
  }
  if (typeof options !== 'undefined') {
    if ('prepend' in options) {
      this.options.prepend = options.prepend
    }
    if ('append' in options) {
      this.options.append = options.append
    }
    if ('inverse' in options) {
      this.options.inverse = options.inverse
    }
  }
  this.lineContent = lineContent.toString()
  return this
}

function check(
  filePath,
  fileContent,
  atLineNumber,
  lineContentOrig,
  options,
  callback,
) {
  var prepend = false
  var append = false
  var newLines = []
  var updatedContent

  var lines = fileContent.split(/\r\n|\r|\n/g)
  const linesContent = lineContentOrig.split(/\r\n|\r|\n/g)
  const linesContentLength = linesContent.length
  var nextLine = lines.length + 1

  if (atLineNumber > nextLine) {
    return callback(new Error('Invalid line'))
  }

  if (options.prepend || atLineNumber === 0) {
    prepend = true
  } else if (options.append || lines.length === atLineNumber + 1) {
    append = true
  }

  if (prepend) {
    updatedContent = lines.slice(0, linesContentLength)
  } else if (append) {
    updatedContent = lines.slice(lines.length - linesContentLength)
  } else {
    updatedContent = lines.slice(
      atLineNumber + linesContentLength * (options.inverse ? -1 : 0),
      atLineNumber + linesContentLength * (options.inverse ? 0 : 1),
    )
  }
  updatedContent = updatedContent.join('\n')
  callback(lineContentOrig == updatedContent)

  // fs.writeFile(filePath, updatedContent, function(err) {
  //   return callback(err)
  // })
}

function Remover(filePath) {
  if (typeof filePath === 'undefined') {
    throw new Error('File path not specified')
  }
  this.filePath = filePath
  this.options = {
    prepend: false,
    append: false,
    inverse: false,
  }
  this.lineContent = 1
  return this
}

Remover.prototype.content = function (lineContent, options) {
  return setUpContent.bind(this)(lineContent, options, false)
}

Remover.prototype.at = function (lineNumber) {
  if (!this.options.append) {
    lineNumber = parseInt(lineNumber)
    if (typeof lineNumber !== 'number' || lineNumber <= 0) {
      throw new Error('Invalid line number')
    }
  }
  this.atLineNumber = lineNumber
  return this
}

Remover.prototype.then = function (callback) {
  if (
    typeof this.atLineNumber === 'undefined' &&
    !this.options.prepend &&
    !this.options.append
  ) {
    return callback(new Error('Line number not set'))
  }
  var filePath = this.filePath
  var self = this
  fs.access(filePath, function (err) {
    if (err) {
      return callback(err)
    }
    fs.readFile(filePath, 'utf8', function (err, fileContent) {
      if (err) {
        return callback(err)
      }
      remove(
        self.filePath,
        fileContent,
        self.atLineNumber,
        self.lineContent,
        self.options,
        callback,
      )
    })
  })
}

function setUpContent(lineContent, options) {
  if (typeof lineContent === 'undefined') {
    lineContent = ''
  }
  this.options = {
    prepend: false,
    append: false,
    inverse: false,
  }
  if (typeof options !== 'undefined') {
    if ('prepend' in options) {
      this.options.prepend = options.prepend
    }
    if ('append' in options) {
      this.options.append = options.append
    }
    if ('inverse' in options) {
      this.options.inverse = options.inverse
    }
  }
  this.lineContent = lineContent.toString().split('\n').length
  return this
}

function remove(
  filePath,
  fileContent,
  atLineNumber,
  lineCount,
  options,
  callback,
) {
  var prepend = false
  var append = false
  var newLines = []
  var updatedContent

  var lines = fileContent.split(/\r\n|\r|\n/g)
  var nextLine = lines.length + 1

  if (atLineNumber > nextLine) {
    return callback(new Error('Invalid line'))
  }

  if (options.prepend || atLineNumber === 1) {
    prepend = true
  } else if (options.append || lines.length + 1 === atLineNumber) {
    append = true
  }

  if (prepend) {
    updatedContent = lines.slice(lineCount)
  } else if (append) {
    updatedContent = lines.slice(0, lines.length - lineCount)
  } else {
    console.log(atLineNumber, lineCount, options.inverse)
    updatedContent = lines.slice(0, atLineNumber + lineCount * (options.inverse ? -1 : 0))
    updatedContent = updatedContent.concat(
      lines.slice(atLineNumber + lineCount * (options.inverse ? 0 : 1)),
    )
  }
  updatedContent = updatedContent.join('\n')

  fs.writeFile(filePath, updatedContent, function (err) {
    return callback(err)
  })
}

function Modifier(filePath) {
  if (typeof filePath === 'undefined') {
    throw new Error('File path not specified')
  }
  this.filePath = filePath
  return this
}

Modifier.prototype.content = function (lineContent, options) {
  return setUpContentModify.bind(this)(lineContent, options, false)
}

Modifier.prototype.at = function (lineNumber) {
  if (!this.options.append) {
    lineNumber = parseInt(lineNumber)
    if (typeof lineNumber !== 'number' || lineNumber <= 0) {
      throw new Error('Invalid line number')
    }
  }
  this.atLineNumber = lineNumber
  return this
}

Modifier.prototype.then = function (callback) {
  if (
    typeof this.atLineNumber === 'undefined' &&
    !this.options.prepend &&
    !this.options.append
  ) {
    return callback(new Error('Line number not set'))
  }
  var filePath = this.filePath
  var self = this
  fs.access(filePath, function (err) {
    if (err) {
      return callback(err)
    }
    fs.readFile(filePath, 'utf8', function (err, fileContent) {
      if (err) {
        return callback(err)
      }
      modify(
        self.filePath,
        fileContent,
        self.atLineNumber,
        self.lineContent,
        self.options,
        callback,
      )
    })
  })
}

function setUpContentModify(lineContent, options) {
  if (typeof lineContent === 'undefined') {
    lineContent = ''
  }
  this.options = {
    prepend: false,
    append: false,
  }
  if (typeof options !== 'undefined') {
    if ('prepend' in options) {
      this.options.prepend = options.prepend
    }
    if ('append' in options) {
      this.options.append = options.append
    }
  }
  this.lineContent = lineContent.toString()
  return this
}

function modify(
  filePath,
  fileContent,
  atLineNumber,
  lineContent,
  options,
  callback,
) {
  var prepend = false
  var append = false
  var newLines = []
  var updatedContent

  var lines = fileContent.split(/\r\n|\r|\n/g)
  const linesContent = lineContent.split(/\r\n|\r|\n/g)
  var nextLine = lines.length + 1

  if (atLineNumber > nextLine) {
    return callback(new Error('Invalid line'))
  }

  if (options.prepend || atLineNumber === 0) {
    prepend = true
  } else if (options.append || lines.length === atLineNumber + 1) {
    append = true
  }

  if (prepend) {
    updatedContent = linesContent.concat(lines.slice(linesContent.length))
  } else if (append) {
    updatedContent = lines
      .slice(0, lines.length - linesContent.length)
      .concat(linesContent)
  } else {
    updatedContent = lines.slice(0, atLineNumber)
    updatedContent = updatedContent
      .concat(linesContent)
      .concat(lines.slice(atLineNumber + linesContent.length))
  }
  updatedContent = updatedContent.join('\n')
  fs.writeFile(filePath, updatedContent, function (err) {
    return callback(err)
  })
}

module.exports = {
  insertLine: function (filePath) {
    return new Inserter(filePath)
  },
  removeLine: function (filePath) {
    return new Remover(filePath)
  },
  modifyLine: function (filePath) {
    return new Modifier(filePath)
  },
  checkLine: function (filePath) {
    return new Checker(filePath)
  },
}
