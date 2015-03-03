/**
 * Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {

    config.disableDragAndDrop = true;
    config.disableObjectResizing = true;

    config.disableNativeSpellChecker = true;

    config.allowedContent = true;

    config.toolbar = 'Custom'; //makes all editors use this toolbar
    config.toolbar_Custom = [];
    config.contentsCss = [CKEDITOR.basePath + 'my/content.css', config.wixViewerCss, config.helveticaFonts];
    config.scayt_autoStartup = true;
    config.scayt_srcUrl = 'http://svc.webspellchecker.net/scayt26/_base.xd.js';
    if(CKEDITOR.env.ie){
        config.contentsCss.push(CKEDITOR.basePath + 'my/content_ie.css');
    }
    config.format_tags = 'h1;h2;h3;h4;h5;h6;address;div;p';
    config.enterMode = CKEDITOR.ENTER_DIV;
    config.autoParagraph = false;
    config.autoGrow_minHeight = 0;
    config.autoGrow_maxHeight = 0;
    config.height = 0;
//    config.baseHref = '';
//    config.blockedKeystrokes = [];
    config.skin = 'empty';
    config.removePlugins = 'resize';

    /** @author etai
     * make the default pasted content type into text.
     * when pasting, we will still try to detect the content type to see if it's html.
     * This means that pasted html will still work normally, but if we paste plaintext, it will preserve the formatting of the block
     */
    config.clipboard_defaultContentType = 'text';

//    config.backColor_style = {
//        element: 'span',
//        styles: { 'background-color': '#(color)', 'padding': '0.2em' }
//    };

    config.styleCommandsToPreserve = [
        {
            'name': 'formatBlock',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                if (editor.config.stylesMap[cmdValue]) {
                    var className = editor.config.stylesMap[cmdValue].cssClass;
                    var oldClassName = oldCmdValue && editor.config.stylesMap[oldCmdValue].cssClass;
                    if (oldClassName) {
                        element.removeClass(oldClassName);
                    }
                    element.addClass(className);
                }
            },
            'isAppliedToList': true
        },
        {
            'name' : 'foreColor',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'color');
            },
            'isAppliedToList': true
        },
        {
            'name' : 'fontFamily',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'font-family');
            },
            'isAppliedToList': true
        },
        {
            'name' : 'lineHeight',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'line-height');
            },
            'isAppliedToList': false
        },
        {
            'name' : 'letterSpacing',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'letter-spacing');
            },
            'isAppliedToList': false
        },
//        {
//            'name' : 'backColor',
//            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
//                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'background-color');
//            }
//        },
        {
            'name' : 'fontSize',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'font-size');
            },
            'isAppliedToList': true
        },
        {
            'name' : 'bold',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'font-weight', 'bold');
            },
            'isAppliedToList': true
        },
        {
            'name' : 'italic',
            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'font-style', 'italic');
            },
            'isAppliedToList': true
        }//,
//        {
//            'name' : 'underline',
//            'applyStyle': function(editor, element, cmdValue, oldCmdValue){
//                applyCmdStyle(editor, element, cmdValue, oldCmdValue, 'text-decoration', 'underline');
//            },
//            'isAppliedToList': true
//        }
    ];
    function applyCmdStyle(editor, element, newValue, oldValue, attrName, attrValue){
        if(newValue == CKEDITOR.TRISTATE_OFF) {
            element.removeStyle(attrName);
        } else{
            var val = attrValue || newValue;
            element.setStyle(attrName, val);
        }
    }

    /**
     * a styles map in the form of: [tag name during editing]: {
     *      cssClass: [class name in the wysiwyg],
     *      seoTag: [tag name in the wysiwyg]
     *  }
     * @type {Object}
     */
    config.stylesMap = {
    };
    config.colorsMap = {
        'color1': '#ff0000',
        'color2': '#00ff00',
        'color3': '#0000ff'
    };
    config.bgColorsMap = {};



    config.format_tags = 'p;h1;h2;h3;h4;h5;h6;address;div';
    config.format_tags_map = {'p': 1,'h1': 1,'h2': 1,'h3': 1,'h4': 1,'h5': 1,'h6': 1,'address': 1,'div': 1};
    //here only for the paste..
    config.format_p = { element: 'p' };

    config.format_div = { element: 'div' };

    config.format_pre = { element: 'pre' };

    config.format_address = { element: 'address' };

    config.format_h1 = { element: 'h1' };

    config.format_h2 = { element: 'h2' };

    config.format_h3 = { element: 'h3' };

    config.format_h4 = { element: 'h4' };

    config.format_h5 = { element: 'h5' };

    config.format_h6 = { element: 'h6' };
};

