var RegexParser = require('regex-parser')
const fs = require('fs')
const lineReader = require('line-reader')
const reverseLineReader = require('reverse-line-reader')
const chalk = require('chalk');
const prompts = require('prompts');

const { insertLine, modifyLine, removeLine, checkLine } = require('./line.js')
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
const addAtLine = async (file, lineIndice, text, options) => {
  const ok = await check(file, lineIndice, text, options)
  if (ok) {
    return null
  }
  await insertLine(file)
    .content(text, options ?? {})
    .at(lineIndice)
}

const addBefore = async (file, lineIndice, text, options) => {
  await addAtLine(file, lineIndice, text, options)
}
const addAfter = async (file, lineIndice, text, options) => {
  await addAtLine(file, lineIndice + 1, text, options)
}

const replace = async (file, lineIndice, text, options) => {
  const ok = await check(file, lineIndice, text, options)
  if (ok) {
    return null
  }
  await modifyLine(file).content(text).at(lineIndice)
}

const check = async (file, lineIndice, text, options) => {
  return await checkLine(file)
    .content(text, { inverse: options?.inverse ?? false })
    .at(lineIndice)
}

const removeAtLine = async (file, lineIndice, text, options) => {
  const ok = await check(file, lineIndice, text, options)
  if (!ok) {
    return null
  }
  await removeLine(file)
    .content(text, { inverse: options?.inverse ?? false })
    .at(lineIndice)
}

const removeBefore = async (file, lineIndice, text, options) => {
  await removeAtLine(file, lineIndice, text, options)
}

const removeAfter = async (file, lineIndice, text, options) => {
  await removeAtLine(file, lineIndice + 1, text, options)
}

const countLineInFile = async (filePath, callback) => {
   const fileBuffer = fs.readFileSync(filePath);
   const to_string = fileBuffer.toString();
   const split_lines = to_string.split("\n");
   return split_lines.length;
}
const getPrompts = async (ask) => {
  const variables = {}
  for (const key in ask){
    const value = ask[key];
     const response = await prompts({
        type: value?.type ?? "text",
        name: key,
        message: value?.message ?? "no mess"
    });
     variables[key] = response[key];
  }
  return variables;
}

const findLineNumber = async (file, pattern = [], way = "top") => {
  return new Promise(async (resolve, reject) => {
    let patternCurr = 0
    let lineNumberPattern = null
    let lineNumber = 0
    if ((pattern === '$' && way === "top")|| (pattern === '^' && way === "bottom")){
      return await countLineInFile(file)
    }
    if ((pattern === '^' && way === "top") || (pattern === '$' && way === "bottom")) {
      return 0;
    }
    if (pattern.length === 0) {
      resolve(null)
      return
    }
    const fn = way === "top" ? lineReader : reverseLineReader;
    fn.eachLine(
      file,
      function (line, last) {
        if (
          pattern[patternCurr].trim() == line.trim() ||
          RegexParser(pattern[patternCurr]).test(line)
        ) {
          lineNumberPattern = lineNumber
          if (pattern.length == patternCurr + 1) {
            resolve(lineNumberPattern)
            return false
          }
          patternCurr = patternCurr + 1
        }
        if (last) {
          resolve(null)
        }
        lineNumber = lineNumber + 1
      },
      function (err) {
        if (err) {
          reject(err)
        }
      },
    )
  })
}

module.exports = {
  asyncForEach,
  addAtLine,
  addBefore,
  addAfter,
  replace,
  removeAtLine,
  removeBefore,
  removeAfter,
  findLineNumber,
  check,
}
