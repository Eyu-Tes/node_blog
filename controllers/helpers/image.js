const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const targetFolder = path.join('media', 'uploads')

const imageResizeAndSave = async (file, newFilePath, oldFilePath) => {
    try {
        await fs.access(targetFolder, async err => {
            if(err) {
                // creates /media/uploads, regardless of whether `/media` & /media/uploads exist
                await fs.mkdir(targetFolder, { recursive: true }, err => {
                    if(err) throw err
                })
            }
        })

        // if oldFilePath is not undefined, create its absolute path
        let oldFileFullPath = oldFilePath && path.resolve(targetFolder, oldFilePath)
        let tempFileFullPath
        if(oldFileFullPath) {
            await fs.access(oldFileFullPath, async err => {
                if(!err) {
                    tempFileFullPath = path.join(targetFolder, `temp${path.extname(oldFileFullPath)}`)
                    await fs.rename(oldFileFullPath, tempFileFullPath, err => {})
                }
            })
        }
        // if newFilePath is not undefined, create its absolute path
        let newFileFullPath = newFilePath && path.resolve(targetFolder, newFilePath)
        const data = await sharp(file.buffer)
        .resize({width: 300, height: 300})
        .toFile(newFileFullPath)

        // delete temp file if found
        if(tempFileFullPath) {
            await fs.unlink(tempFileFullPath, err => {})
        }
        
        return data
    }
    catch(err) {
        console.log(err)
    }
}

const imageDelete = async (filePath) => {
    const fileFullPath = filePath && path.resolve(targetFolder, path.basename(filePath))
    if (fileFullPath) {
        await fs.access(fileFullPath, async err => {
            if(!err) {
                await fs.unlink(fileFullPath, err => {})
            }
        })
    }
}

module.exports = {
    imageResizeAndSave, 
    imageDelete
}
