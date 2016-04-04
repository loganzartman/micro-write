var Editor = {
    element: null,
    data: {
        text: null,
        formatList: null
    },
    format: null,
    formatStart: null,
    formatEnd: null,

    setElement: function(el) {
        this.element = el;
    },
    load: function(data) {
        if (!data) {
            console.log("No data supplied.");
            data = {};
        }
        if (!data.text) {
            console.log("No text contained in data.");
            this.setText("");
        }
        else {
            if (data.b64) {this.setText(Base64.decode(data.text));}
            else {this.setText(data.text);}
        }
        if (!data.formatList) {
            console.log("No formatting information in data.");
            this.setFormatList([]);
        }
        else {this.setFormatList(data.formatList);}
    },
    setText: function(str) {
        this.data.text = str;
    },
    setFormat: function(type) {
        this.format = type;
    },
    setFormatList: function(arr) {
        this.data.formatList = arr;
    },
    applyFormat: function(str, format) {
        var start = Math.max(0, format.start),
            end = Math.min(str.length, format.end);
        if (end - start <= 0) return str;

        var substr = str.substring(start, end);
        var pre = str.substring(0, start),
            post = str.substring(end);
        switch (format.type) {
            case Format.BOLD:
                substr = "<b>"+substr+"</b>";
                break;
            case Format.ITALIC:
                substr = "<i>"+substr+"</i>";
                break;
            case Format.UNDERLINE:
                substr = "<u>"+substr+"</u>";
                break;
        }
        return pre+substr+post;
    },
    getText: function() {
        return this.data.text;
    },
    getSelectionRange: function() {
        var sel = window.getSelection();
        for (var i=0; i<sel.rangeCount; i++) {
            var range = sel.getRangeAt(i);
            if (range.commonAncestorContainer === this.element) {
                return range;
            }
        }
        return {
            startOffset: 0,
            endOffset: this.getText().length
        };
    },
    getSelectedText: function() {
        var range = this.getSelectionRange();
        return this.getText().substring(range.startOffset, range.endOffset);
    },
    getFormat: function() {
        return this.format;
    },
    getFormatList: function() {
        return this.data.formatList;
    },
    serialize: function(useBase64) {
        var obj = {
            text: this.getText(),
            formatList: this.getFormatList()
        };
        if (useBase64) {
            obj.text = Base64.encode(obj.text);
            obj.b64 = true;
        }
        return obj;
    },
    render: function(startIndex, endIndex) {
        var html = this.getText();
        var offset = 0;

        if (startIndex) {
            offset = -startIndex;
            html = html.substring(startIndex, endIndex);
        }

        var editor = this;
        this.data.formatList.forEach(function(format){
            var len0 = html.length;
            html = editor.applyFormat(html, {
                type: format.type,
                start: format.start + offset,
                end: format.end + offset
            });
            offset += html.length - len0;
        });

        return html;
    }
};
var Format = {
    NONE: 0,
    BOLD: 1,
    ITALIC: 2,
    UNDERLINE: 3
};
