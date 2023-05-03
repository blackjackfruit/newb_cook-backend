const fs = require('fs')
const url = require('url');
const path = require('path');


// function which finds the root dir of the project by looking for the file .rootDir by recursively going up the directory tree
function root_dir() {
    let current_dir = __dirname
    let root_dir = ""
    while (current_dir != "/") {
        if (fs.existsSync(current_dir + "/.rootDir")) {
            root_dir = current_dir
            break
        }
        current_dir = current_dir.substring(0, current_dir.lastIndexOf("/"))
    }
    if (root_dir == "") {
        throw new Error("Unable to find root directory")
    }
    if (process.env.NODE_ENV === 'test') {
        return root_dir + '/test'
    }
    return root_dir
}

module.exports = { root_dir }