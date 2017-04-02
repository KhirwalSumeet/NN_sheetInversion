Rotate Google Sheets Api
========================

This is a standalone program to rotate data in spreadsheets by 90 degrees using google sheets api.

```
npm install
npm start
```

## Api End-points

### /data/sheet/<YOUR SHEET ID>

This api is used to fetch data from excel having following assumptions :

Assumption

1. Data is always tabular and all the columns are filled
2. Table does not have a header
3. Table can have any number of rows and columns(basically size is dynamic)
4. Spreadsheet is always public
5. All the cells of the data are integers.

Input to the standalone program: the id of the spreadsheet

Sample Spreadsheet:

https://docs.google.com/spreadsheets/d/1psnLyQ1uP120JHnNYY5Pc_2T6bQl3QC6ifskYMnVC2k

Input, as in the spreadsheet

```
1 2 3 4

7 8 9 10

12 13 14 16

17 18 19 20
```

Desired Output

```
17 12 7 1

18 13 8 2

19 14 9 3

20 16 10 4
```

### Error Codes

- 404 : Sheet not Found
- 504 : Error in Network connection

### For Production

Used npm package 'forever' to restart app incase any error is thrown.
To install forever in your computer , use following command :

```
sudo npm install -g forever
```

Note : Google v4 api uses request module. If you are working behind a proxy network then follow the following steps:

Got to node_modules/request/lib/querystring.js and make changes in function Querystring ( Line 3 or Line 4 ).
Add following code lines at beginning of function :

request.proxy='<YOUR PROXY URL>';

Note : I had included client_Secret.json. But for first time you have to download your own api key using step 1 in the following link : https://developers.google.com/sheets/api/quickstart/nodejs and replace it with client_secret.json in present directory