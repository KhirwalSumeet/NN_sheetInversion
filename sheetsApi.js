var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var express=require("express");

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
// Exporting Fetch Sheet Module
exports.fetchSheet= function(sheetid,cb){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
      // Authorize a client with the loaded credentials, then call the
      // Google Sheets API.
        authorize(JSON.parse(content), sheetid,cb, listMajors);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, sheetid,cb, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client,sheetid,cb, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client, sheetid,cb);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client,sheetid,cb, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client,sheetid,cb);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Fetch the data of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1psnLyQ1uP120JHnNYY5Pc_2T6bQl3QC6ifskYMnVC2k/edit
 */

function listMajors(auth,sheetid,cb) {
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: sheetid,
        range: 'Sheet1'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            cb(err,null);
            return;
        }
        var rows = response.values;
        var newdata =rotateData(rows);
        var message = saveSheet(auth,sheetid,newdata);
        if(message == "Done"){
            console.log("Sheet rotated and saved Successfully");
            cb(null,"Successfully updated");
        }else{
            cb(message,null);
        }
    });

}

// Rotate my data by 90 degrees

function rotateData(data) {
    var n=data.length;
    for (i=0;i<n/2;i++) {
        for (j=0;j<Math.floor(n/2);j++) {
            var temp = data[i][j];
            data[i][j] = data[n-1-j][i];
            data[n-1-j][i] = data[n-1-i][n-1-j];
            data[n-1-i][n-1-j] = data[j][n-1-i];
            data[j][n-1-i] = temp;
        }
    }
    return data;
}

// Update my spreadsheet

function saveSheet(auth,sheetid,newdata){
    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: sheetid,
        range: 'Sheet1',
        valueInputOption: 'USER_ENTERED',
        resource : { values: newdata }
    }, function(err, response) {
    if (err) {
        console.log('The API returned an error: ' + err);
        return err;
    }});

    return "Done";
}

