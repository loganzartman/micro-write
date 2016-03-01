var DS = {
    ENABLE_DEBUG: true,
    CLIENT_ID: "613400282980-m85thkecq22otd34hmovpf8jd2eu71sd.apps.googleusercontent.com",
    FILE_NAME: "microwrite-data",
    SCOPES: [
        "https://www.googleapis.com/auth/drive.file"
    ],

    _fid: null,
    
    /**
     * Called when the client library is loaded.
    */
    handleClientLoad: function() {
        DS._log("Client load");
        DS.checkAuth();
    },

    /**
     * Check if the current user has authorized the application.
     */
    checkAuth: function() {
        gapi.auth.authorize({
            "client_id": DS.CLIENT_ID,
            "scope": DS.SCOPES, 
            "immediate": true
        }, DS.handleAuthResult);
    },

    /**
     * Called when authorization server replies.
     * @param {Object} authResult Authorization result.
     */
    handleAuthResult: function(authResult) {
        if (authResult) {
            // Access token has been successfully retrieved, requests can be sent to the API
            DS._log("Authorized");
            gapi.client.load('drive', 'v2', DS.apiLoad);
        } else {
            // No access token could be retrieved, force the authorization flow.
            gapi.auth.authorize({
                "client_id": CLIENT_ID,
                "scope": SCOPES,
                "immediate": false
            }, DS.handleAuthResult);
        }
    },
    
    /**
     * Handles the Drive API load event. This implies successful authorization.
     */
    apiLoad: function() {
        DS.getDataFile(function(file){
            var f = function(file) {
                DS.updateDataFile("{\"test\": 420}", function(file){
                    DS._log("Test data written");
                });
            }
            if (!file) {DS._log("File DNE, creating");DS.createDataFile(f);}
            else {DS._log("File exists, continuing");f(file);}
        });
    },
    
    /**
     * Finds and retrieves the DS data file.
     * Passes the file resource to the callback when complete.
     * If the file resource is not found, passes false instead.
     */
    getDataFile: function(callback) {
        var req = gapi.client.drive.files.list({
            "fields": "items/id,items/labels/trashed,items/modifiedDate,items/title"
        });
        req.execute(function(resp){
            if (resp.items) {
                DS._log("Files received");
                var file = resp.items.find(function(f){return f.title === DS.FILE_NAME});
                DS._log(file);
                if (file && file.id) DS._fid = file.id; 
                callback(file);
            }
            else {
                callback(false);
            }
        });
    },
    
    /**
     * Retrieves the current contents of the data file.
     * Must have called getDataFile() at least once to obtain file ID.
     * Passes the file contents to the callback.
     */
    getDataContents: function(callback) {
        if (!DS._fid) throw new Error("File ID has not been retrieved; call getDataFile() first.");
        var req = gapi.client.drive.files.get({
            "fileId": DS._fid,
            "alt": "media"
        });
        req.execute(function(resp){
            callback(resp);
        });
    },
    
    /**
     * Creates the data file. If it already exists, updateDataFile() should
     * be used instead to modify it.
     */
    createDataFile: function(callback) {
        var req = gapi.client.drive.files.insert({
            "title": DS.FILE_NAME
        });
        req.execute(function(resp){
            DS._log("File created");
            callback(resp); 
        });
    },
    
    /**
     * Modifies the current contents of the data file.
     * Must have called getDataFile() at least once to obtain file ID.
     * Passes the file to the callback.
     */
    updateDataFile: function(data, callback) {
        if (!DS._fid) throw new Error("File ID has not been retrieved; call getDataFile() first.");
        var req = gapi.client.request({
            "path": "/upload/drive/v2/files/" + DS._fid,
            "method": "PUT",
            "params": {"uploadType": "media", "alt": "json"},
            "headers": {"Content-Type": "text/plain"},
            "body": data
        });
        req.execute(function(resp){
            DS._log("Wrote data");
            callback(resp);
        });
    },

    _log: function(s) {
        if (DS.ENABLE_DEBUG) {
            if (s instanceof String)
                console.log("DriveSync: " + s);
            else
                console.log(s);
        }
    }
};
var DSHandleClientLoad = DS.handleClientLoad;