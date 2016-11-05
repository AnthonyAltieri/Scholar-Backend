'use strict';

import mongoose from 'mongoose';

// Import Schemas
import FilesystemSchema from '../schemas/Filesystem';
import FileSchema from '../schemas/File';
import DirectorySchema from '../schemas/Directory';

// Create models
const Filesystem = mongoose.model('filesystems', FilesystemSchema);
const File = mongoose.model('files', FileSchema);
const Directory = mongoose.model('Directories', DirectorySchema);

import fs from 'fs';
import path from 'path';

/**
 * A service that manages a user's filesystem, this includes: making a filesystem
 * directory for a user, adding a file to a user's filesystem, adding a directory
 * to a user's filesystem, deleting a file, deleting a directory, deleting a user's
 * filesystem
 */
class FileSystemService {
  constructor() {};

  /**
   * Creates a folder for a user
   * @param userId - The user who a folder is being created for
   * @return true if Filesystem is saved correctly false if there was an error
   */
  static createUserFolder(userId) {
    // TODO: Consider encrypting this
    let userPath = path.join(__dirname, ('../filesystem/' + userId));
    fs.stat(userPath, (err, stat) => {
      if (!stat) {
        // Directory does not exist, so create it
        fs.mkdir(userPath, exception => {
          if (exception) {
            console.error(`Exception: ${exception}`);
            return;
          }
          console.log(`Filesystem folder successfully created for ${userId}`);
          const filesystem = new Filesystem({
            list: [],
            stickies: []
          });
          filesystem.save(err => {
            if (err) {
              console.error(`Error saving filesystem: ${err}`);
              return false;
            }
            return true;
          });
        })
      } else {
        // Directory exists
        return false;
      }
     
    });
  }

  /**
   * Adds a file to a user's filesystem
   * @param userId - The user associated with the filesystem
   * @param fileName - The name of the file
   * @param file - The file data to be written
   * @param date - The date the file was created on
   * @return true if file was added correctly and false if there was an error
   */
  static addFile(userId, fileName, file, date) {
    let directoryPath = path.join(__dirname, ('../filesystem/' + userId));
    fs.stat(directoryPath, (err, stat) => {
      if (!stat) {
        console.error(`User does not have a filesystem directory`);
        return false;
      }
      let filePath = path.join(__dirname, ('../filesystem/' + userId + '/' + fileName));
      fs.writeFile(filePath, file, err => {
        if (err) {
          console.error(`Error writing file: ${err}`);
          return false;
        }
        const file = new File({
          userId: userId,
          created: date
        });
        file.save(err => {
          if (err) {
            console.error(`Error saving file: ${err}`);
            return false;
          }
          return true;
        })
      });
    });
  }

}

