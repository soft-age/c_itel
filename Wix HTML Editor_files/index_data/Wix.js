var Wix = Wix || {};

Wix.Activities = (function () {
    var _w, _dispatcher, _handlers;

    return {
        init: function(w, dispatcher, handlers){
            _w = w;
            _dispatcher = dispatcher;
            _handlers = handlers;
        },


        /**
         * Enum Activities Type
         *
         * @since SDK 1.25.0
         */
        Type: {
            /**
             * @since SDK 1.25.0
             *
             */
            CONTACT_CONTACT_FORM:'contact/contact-form',
            ECOMMERCE_PURCHASE:'e_commerce/purchase',
            AUTH_STATUS_CHANGE:'auth/status-change',
            AUTH_REGISTER:'auth/register',
            AUTH_LOGIN:'auth/login'
        },

        Error: {
            BAD_DATES: 'BAD_DATES',
            ACTIVITY_NOT_FOUND: 'ACTIVITY_NOT_FOUND',
            WRONG_PERMISSIONS: 'WRONG_PERMISSIONS'
        },
        /*
         * Function postActivity
         *
         * Posts an Activity to the Wix cloud
         *
         * @since SDK 1.25.0
         * @param activity (Object) - an activity descriptor, must follow specific type/schema pattern
         * 	Object
         * 	type (Wix.Activity.Type) - the activity type
         * 	info (Object) - the activity information, specific by activity type
         * 	details (Object) - {additionalInfoUrl:"some-url", summary:"what am I..."}
         * 	contactUpdate (Object) - optional, in case the user's contact info need to be change
         * @param onSuccess (Function) - success callback function
         * @param onFailure (Function) - failure callback function
         */
        postActivity: function(activity, onSuccess, onFailure) {
            if (Wix.Utils.getViewMode() !== "site") {
                _w.reportSdkError('Invalid View Mode, Wix.postActivity is available only for site view mode');
                return;
            }
            var args = {
                activity:activity
            };

            var onComplete = null;
            if (onSuccess || onFailure) {
                onComplete = function(result) {
                    if(result.status && onSuccess) {
                        onSuccess(result.response);
                    } else if (onFailure) {
                        onFailure(result.response);
                    }
                }
            }
            _dispatcher.sendMessage(_w.MessageTypes.POST_ACTIVITY, args, onComplete);
        },
        /**
         * Function getActivities
         *
         * Gets a list of all activities posted within the site.
         *
         * @since 1.28.0
         * @return (WixDataCursor) cursor
         */
        getActivities: function (onSuccess, onFailure, query) {
            if (typeof onSuccess !== 'function') {
                _w.reportSdkError('Missing mandatory argument - onSuccess, must be a function');
                return;
            }

            if (typeof onFailure !== 'function') {
                _w.reportSdkError('Missing mandatory argument - onFailure, must be a function');
                return;
            }

            _w.trackSDKCall("Activities.getActivities");

            var args = {
                query: query
            };

            var onComplete = function onComplete(response) {
                _handlers.handleCursorResponse(response, onSuccess, onFailure, _w.MessageTypes.GET_ACTIVITIES);
            };

            _dispatcher.sendMessage(_w.MessageTypes.GET_ACTIVITIES, args, onComplete);
        },

        /**
         * Function getActivityById
         *
         * Gets a specific Activity that has been posted within the current site by its id.
         *
         * @since
         * @param id (String)
         * @param onSuccess (Function)
         * @param onFailure (Function)
         * @return (Object) contact
         */
        getActivityById: function (id, onSuccess, onFailure) {
            if (typeof id !== 'string') {
                _w.reportSdkError('Missing mandatory argument - id, must be a string');
                return;
            }
            if (typeof onSuccess !== 'function') {
                _w.reportSdkError('Missing mandatory argument - onSuccess, must be a function');
                return;
            }
            if (typeof onFailure !== 'function') {
                _w.reportSdkError('Missing mandatory argument - onFailure, must be a function');
                return;
            }

            _w.trackSDKCall("Contacts.getActivityById");

            var args = {
                id: id
            };

            var onComplete = function onComplete(result) {
                _handlers.handleDataResponse(result, onSuccess, onFailure);
            };

            _dispatcher.sendMessage(_w.MessageTypes.GET_ACTIVITY_BY_ID, args, onComplete);
        },
        /**
         * Function getUserSessionToken
         *
         * Returns a session token which can be used to make AJAX calls to Wix Cloud API
         *
         * @since SDK 1.25.0
         * @param callback (Function) a callback function that returns the user session token
         *   callback signature: function(data) {}
         *   data signature: "a-very-long-token-123"
         */
        getUserSessionToken:function(callback) {
            _dispatcher.sendMessage(_w.MessageTypes.GET_USER_SESSION, null, callback);
        }
    }
}());

var Wix = Wix || {};

Wix.WixDataCursor = (function () {
    var _callService = function (onSuccess, onFailure, cursorId) {
        var that = this;
        var onComplete = function onComplete(response) {
            if (response.error) {
                onFailure(response);
            } else {
                that._nextCursor = response.data.nextCursor;
                that._previousCursor = response.data.previousCursor;
                that._data = response.data.results;
                onSuccess(response.data.results);
            }
        };

        this.dispatcher.sendMessage(this._serviceMessageType, { cursorId: cursorId }, onComplete);
    };

    function WixDataCursor(dispatcher, serviceMessageType, data) {
        if (typeof serviceMessageType !== 'string' || typeof dispatcher === 'undefined') {
            throw new Error('Mandatory parameters are missing.');
        }

        this._serviceMessageType = serviceMessageType;
        this._data = data || [];
        this._nextCursor = null;
        this._previousCursor = null;
        this.dispatcher = dispatcher;
    }

    WixDataCursor.prototype.hasNext = function hasNext() {
        return !!this._nextCursor;
    };

    WixDataCursor.prototype.hasPrevious = function hasPrevious() {
        return !!this._previousCursor;
    };

    WixDataCursor.prototype.next = function next(onSuccess, onFailure) {
        if(this.hasNext()){
            _callService.call(this, onSuccess, onFailure, this._nextCursor);
        } else {
            onSuccess([]);
        }
    };

    WixDataCursor.prototype.previous = function previous(onSuccess, onFailure) {
        if(this.hasPrevious()){
            _callService.call(this, onSuccess, onFailure, this._previousCursor);
        } else {
            onSuccess([]);
        }
    };

    WixDataCursor.prototype.setData = function setData(data) {
        this._data = data;
    };

    WixDataCursor.prototype.getData = function getData() {
        return this._data;
    };

    WixDataCursor.prototype.setNextCursor = function setNextCursor(cursor) {
        this._nextCursor = cursor;
    };

    WixDataCursor.prototype.setPreviousCursor = function setPreviousCursor(cursor) {
        this._previousCursor = cursor;
    };

    return WixDataCursor;
})();
var Wix = Wix || {};

Wix.Dashboard = (function() {
    return {
        /**
         * Function setHeight
         *
         * @since SDK 1.24.0
         * @param height (Number) new component height
         */
        setHeight:function (height) {
            Wix.setHeight(height);
        },

        /** Function openMediaDialog
         *
         * Opens the Wix media dialog and let's the site owner choose a file from the
         * Wix collection, or upload a new file instead.
         *
         * @since SDK 1.27.0
         * @param mediaType (MediaType enum) use one of the MediaType enum values
         * @param multipleSelection (Boolean) selection mode, single/false or multiple/true item to choose
         * @param onSuceess (Function) callback function: function(data) {...} where the data schema is:
         *          fileName (String) - media item title
         *          type (String) - e.g. 'Image', 'AudioPlayer'
         *          relativeUri (String) -  media item uri (relative to Wix media gallery) use Wix.Utils.Media.get* to get an actual url
         *          width - media type width (for images)
         *          height - media type height (for images)
         */
        openMediaDialog: function(mediaType, multipleSelection, onSuccess) {
            Wix.Settings.openMediaDialog(mediaType, multipleSelection, onSuccess);
        },


        /**
         * Function openModal
         *
         * @since SDK 1.27.0
         * @param url (String) popup iframe's url
         * @param width (Number) popup width in pixels
         * @param height (Number) popup height in pixels
         * @param onClose (Function) on close callback function
         */
        openModal:function (url, width, height, onClose) {
            Wix.openModal(url, width, height, onClose);
        },


        /*
         * Function closeWindow
         *
         * Closes the app's modal/popup window.
         * This function can be used from a popup scope only!!
         *
         * @since SDK 1.27.0
         * @param (Object)
         */
        closeWindow:function (message) {
            Wix.closeWindow(message);
        }
    }
})();
var Wix = Wix || {};

Wix.Contacts = (function () {
    var _w, _dispatcher, _handlers;

    return {
        init: function(w, dispatcher, handlers){
            _w = w;
            _dispatcher = dispatcher;
            _handlers = handlers;
        },

        /**
         * Function getContacts
         *
         * Gets a list of all contacts that have interacted with a given site.
         *
         * @since  SDK 1.27.0
         * @param onSuccess (Function) an on success callback which gets WixDataCursor as parameter
         * @param onFailure (Function) an on failure callback
         * @return (WixDataCursor) cursor
         */
        getContacts: function (onSuccess, onFailure) {
            _w.trackSDKCall("Contacts.getContacts");

            if (typeof onSuccess !== 'function') {
                _w.reportSdkError('Missing mandatory argument - onSuccess, must be a function');
                return;
            }

            var onComplete = function onComplete(response) {
                _handlers.handleCursorResponse(response, onSuccess, onFailure, _w.MessageTypes.GET_CONTACTS);
            };

            _dispatcher.sendMessage(_w.MessageTypes.GET_CONTACTS, undefined, onComplete);
        },

        /**
         * Function getContactById
         *
         * Gets a specific Contact that has interacted with the current site by its id.
         *
         * @since SDK 1.27.0
         * @param id (String) The id of the Contact to look up
         * @param onSuccess (Function) A function that receives data about the Contact
         * @param onFailure (Function) A function called when an error occurs that receives a Wix.Error
         * @return (Object) contact
         */
        getContactById: function (id, onSuccess, onFailure) {
            _w.trackSDKCall("Contacts.getContactById");

            if (typeof id !== 'string') {
                _w.reportSdkError('Missing mandatory argument - id, must be a string');
                return;
            }
            if (typeof onSuccess !== 'function') {
                _w.reportSdkError('Missing mandatory argument - onSuccess, must be a function');
                return;
            }
            if (typeof onFailure !== 'function') {
                _w.reportSdkError('Missing mandatory argument - onFailure, must be a function');
                return;
            }

            var args = {
                id: id
            };

            var onComplete = function onComplete(response) {
                _handlers.handleDataResponse(response, onSuccess, onFailure);
            };

            _dispatcher.sendMessage(_w.MessageTypes.GET_CONTACT_BY_ID, args, onComplete);
        }
    }
})();
var Wix = Wix || {};

Wix.PubSub = (function () {
    var _w, _dispatcher;

    return {
        init: function(w, dispatcher) {
            _w = w;
            _dispatcher = dispatcher;
        },
        /**
         * Function unsubscribe
         *
         *
         * @since SDK 1.25.0
         * @param eventKey (String) a string identifying the event
         * @param callBackOrId (Number) an id for the callback function used to subscribe to the event
         */
        unsubscribe: function(eventKey, callBackOrId){
            _w.removeEventListenerInternal(_w.TPA_PUB_SUB_PREFIX + eventKey, callBackOrId, true);
        },
        /**
         * Function subscribe
         * @since SDK 1.25.0
         * @param eventKey (String) a string identifying the event
         * @param callBack (Function) a callback function that gets invoked every time a new event happens
         * 		callback signature: function(event) {}
         * 		event signature: {name:eventKey, data: eventData, origin: compId}
         * @param receivePastEvents (Boolean) should past events be received as well
         * @retrun (Number) an id that can be used to remove the event subscription using unsubscribe(eventKey, id)
         */
        subscribe:function(eventKey, callBack, receivePastEvents){
            if (typeof eventKey !== 'string') {
                _w.reportSdkError('Missing mandatory argument - eventKey, must be a string');
                return;
            }
            if (typeof callBack !== 'function') {
                _w.reportSdkError('Missing mandatory argument - callBack, must be a function');
                return;
            }
            return _w.addEventListenerInternal(_w.TPA_PUB_SUB_PREFIX + eventKey, callBack, true, {receivePastEvents:receivePastEvents});
        },
        /**
         * Function publish
         * @since SDK 1.25.0
         * @param eventKey (String) a string identifying the event
         * @param data (Object) the event custom data
         * @param isPersistent (Boolean) should the event be saved to be delivered as past event
         */
        publish:function(eventKey, data, isPersistent){
            if (typeof eventKey !== 'string') {
                _w.reportSdkError('Missing mandatory argument - eventKey, must be a string');
                return;
            }
            _dispatcher.sendMessage(_w.MessageTypes.PUBLISH, {
                eventKey:  _w.TPA_PUB_SUB_PREFIX + eventKey,
                isPersistent: !!isPersistent || false,
                eventData: data || {}
            });
        }
    }
})();
var Wix = Wix || {};

Wix.ResponseHandlers = (function () {
    var _w, _dispatcher;

    return {
        init: function(w, dispatcher){
            _w = w;
            _dispatcher = dispatcher;
        },

        getWixError: function (errorCode) {
            var wixErrorMessage = Wix.Error.WIX_ERROR;

            switch (errorCode) {
                case 404:
                    wixErrorMessage = Wix.Error.NOT_FOUND;
                    break;
                case 400:
                    wixErrorMessage = Wix.Error.BAD_REQUEST;
                    break;
                case 'INVALID_SCHEMA':
                    wixErrorMessage = Wix.Error.INVALID_SCHEMA;
                    break;
            }

            return wixErrorMessage;
        },

        handleDataResponse: function (response, onSuccess, onFailure) {
            if (response.error) {
                var wixErrorMessage = this.getWixError(response.error.errorCode);
                onFailure && onFailure(wixErrorMessage);
            } else {
                onSuccess(response.data);
            }
        },

        handleCursorResponse: function (response, onSuccess, onFailure, messageType) {
            if (!response.error) {
                var cursor = new Wix.WixDataCursor(_dispatcher, messageType, response.data.results);
                cursor.setNextCursor(response.data.nextCursor);
                cursor.setPreviousCursor(response.data.previousCursor);
                onSuccess(cursor);
            } else {
                var wixErrorMessage = this.getWixError(response.error.errorCode);
                onFailure && onFailure(wixErrorMessage);
            }
        }
    }
}());

var Wix = Wix || {};


Wix.BaseAPI = (function() {
    var _w, _dispatcher, _utils;
    return {
        init: function(w, dispatcher, utils){
            _w = w;
            _dispatcher = dispatcher;
            _utils = utils;
        },
        /**
         * Function getStyleParams
         *
         * Returns the application style parameters which are saved in the site
         *
         * @deprecated
         * @since SDK 1.22.0
         * @param callback (Function) callback function: function(style) {...}
         * @return (Object) a map describing style parameters by their type. E.g {colors: {bgColor: {value:'#FFFFFF'} }}
         */
        getStyleParams: function(callback){
            _w.reportSdkMsg('Wix.getStyleParams is DEPRECATED use Wix.Styles.getStyleParams');
            return Wix.Styles.getStyleParams(callback);
        },

        /**
         * Function reportHeightChange
         *
         * @deprecated use setHeight
         */
        reportHeightChange:function (height) {
            _w.reportSdkError('Deprecated, use Wix.setHeight instead');
        },

        /**
         * Function setHeight
         *
         * @since SDK 1.8.0
         * @param height (Number) new component height
         */
        setHeight:function (height) {
            if (typeof height !== "number") {
                _w.reportSdkError('Mandatory argument - height - should be of type Number');
                return;
            } else if (height < 0) {
                _w.reportSdkError('height should be a positive integer');
                return;
            }
            _w.sendMessageInternal2(_w.MessageTypes.HEIGHT_CHANGED, {'height':height});
        },

        /**
         * Function pushState
         *
         * @since SDK 1.8.0
         * @param state (String) new app's state to push into the editor history stack
         */
        pushState:function (state) {
            if (typeof state !== "string") {
                _w.reportSdkError('Missing mandatory argument - state');
                return;
            }
            _w.sendMessageInternal(_w.MessageTypes.APP_STATE_CHANGED, {'state': state});
        },

        /**
         * Function getSiteInfo
         *
         * @param onSuccess (Function) a callback function that returns the site info
         *   The function signature should be :
         *   function onSuccess(param) {...}
         */
        getSiteInfo:function (onSuccess) {
            _w.sendMessageInternal2(_w.MessageTypes.SITE_INFO, null, onSuccess);
        },

        /**
         * Function getSitePages
         *
         * Returns the pages which are used in hosting site by name
         *
         * @since 1.17.0
         * @param callback (Function) a callback function that returns the site pages
         *   callback signature: function(data) {}
         *   data signature: { pages: ['page1', 'page2', 'myPage', ...]}
         */
        getSitePages: function(callback) {
            _w.sendMessageInternal2(_w.MessageTypes.GET_SITE_PAGES, null, callback);
        },

        /**
         * Function navigateToPage
         *
         * Returns the pages which are used in hosting site by name
         *
         * @since 1.17.0
         * @param pageId (String) the page name as received by getSitePages
         *
         */
        navigateToPage: function(pageId) {
            if (!pageId) {
                _w.reportSdkError('Missing mandatory argument - pageId');
                return;
            }

            _w.sendMessageInternal2(_w.MessageTypes.NAVIGATE_TO_PAGE, {pageId: pageId});
        },

        /**
         * Function currentMember
         *
         * @since SDK 1.6.0
         * @param onSuccess (Function) a call back function to receive the function completion
         * status. The function signature should be :
         *  function onSuccess(param) {...}
         */
        currentMember:function (onSuccess) {
            if (this.Utils.getViewMode() !== "site") {
                _w.reportSdkError('Invalid View Mode, this method works only for site view mode');
                return;
            }
            _w.sendMessageInternal2(_w.MessageTypes.SM_CURRENT_MEMBER, null, onSuccess);
        },

        /**
         * Function requestLogin
         *
         * @since SDK 1.3.0
         * @param onSuccess (Function) a callback function to receive the operation completion
         * status. The function signature should be :
         *  function onSuccess(param) {...}
         */
        requestLogin:function (onSuccess) {
            _w.sendMessageInternal2(_w.MessageTypes.SM_REQUEST_LOGIN, null, onSuccess);
        },

        /**
         * Function openPopup
         *
         * @param url (String) popup iframe's url
         * @param width (Number) popup width in pixels
         * @param height (Number) popup height in pixels
         * @param position (Object) properties
         *     Object
         * 		  origin (WindowOrigin enum) popup origin point, reserved values. One of WindowOrigin's values, default is set to WindowOrigin.RELATIVE
         * 		  placement (WindowPlacement enum) - a predefine set of common placements, default is set to WindowPlacement.CENTER
         *        x (Number) - where popup should be opened horizontally relative to the top left corner of the widget, default is set to zero.
         *        y (Number) - where popup should be opened vertically relative to the top left corner of the widget, defaults is set to zero.
         *  example - {origin: Wix.WindowOrigin.RELATIVE, placement: Wix.WindowPlacement.TOP_CENTER}
         * @param onClose (Function) on close callback function
         * @param theme (Theme enum) popup theme see
         */
        openPopup:function (url, width, height, position, onClose, theme) {
            if (_utils.getViewMode() === "editor") {
                _w.reportSdkError('Invalid View Mode, editor, only preview and site are supported');
                return;
            }

            // in case position was omitted and the last argument is the onClose callback
            if (arguments.length === 4 && typeof arguments[3] === 'function') {
                position = {};
            }

            position = position || {};
            position.origin = position.origin || this.WindowOrigin.DEFAULT;
            position.placement = position.placement || this.WindowPlacement.CENTER;

            var args = {
                url   : url,
                width : width,
                height: height,
                position: position,
                theme: theme || Wix.Theme.DEFAULT
            };
            _dispatcher.sendMessage(_w.MessageTypes.OPEN_POPUP, args, onClose);
        },

        /**
         * Function openModal
         *
         * @since SDK 1.13.0
         * @param url (String) popup iframe's url
         * @param width (Number) popup width in pixels
         * @param height (Number) popup height in pixels
         * @param onClose (Function) on close callback function
         */
        openModal:function (url, width, height, onClose) {
            if (this.Utils.getViewMode() === "editor") {
                _w.reportSdkError('Invalid View Mode, editor, only preview and site are supported');
                return;
            }

            var args = {
                url   : url,
                width : width,
                height: height
            };
            _w.sendMessageInternal2(_w.MessageTypes.OPEN_MODAL, args, onClose);
        },

        /*
         * Function closeWindow
         *
         * Closes the app's modal/popup window.
         * This function can be used from a popup scope only!!
         *
         * @since SDK 1.13.0
         * @param (Object)
         */
        closeWindow:function (message) {
            var args = {
                message : message
            };
            _w.sendMessageInternal2(_w.MessageTypes.CLOSE_WINDOW, args);
        },

        /*
         * Function resizeWindow
         *
         * Resizes the widget modal/popup/glued widget window.
         *
         * @since SDK 1.18.0
         * @param width (Number) popup width in pixels
         * @param height (Number) popup height in pixels
         * @param onComplete (Function) on complete callback function
         */
        resizeWindow:function (width, height, onComplete) {
            var args = {
                width : width,
                height: height
            };
            _w.sendMessageInternal2(_w.MessageTypes.RESIZE_WINDOW, args, onComplete);
        },

        /**
         * Function addEventListener
         *
         * @since SDK 1.11.0
         * @param eventName (String) the event name, reserved values, see Wix.Events
         * @param callBack (Function) a callback function which gets invoked when a new
         * event is sent from the wix site, The function signature should be :
         *  function callBack(param) {...}
         * @retrun (Number) an id that can be used to remove the event listener using removeEventListener(eventName, id)
         */
        addEventListener: function(eventName, callBack) {
            return _w.addEventListenerInternal(eventName, callBack, false);
        },

        /**
         * Function removeEventListener
         *
         * @since SDK 1.25.0
         * @param eventName (String) the event name, reserved values, see Wix.Events
         * @param callBackOrId
         */
        removeEventListener: function(eventName, callBackOrId) {
            _w.removeEventListenerInternal(eventName, callBackOrId, false);
        },

        /*
         * Function scrollTo
         *
         * Scroll (in the Wix site) to an absolute offset - vertical & horizontal
         *
         * @since SDK 1.18.0
         * @param x (Number) horizontal offset in pixels
         * @param y (Number) vertical offset in pixels
         */
        scrollTo: function(x, y) {
            var args = {
                x : x,
                y: y
            };
            _w.sendMessageInternal2(_w.MessageTypes.SCROLL_TO, args);
        },

        /*
         * Function scrollBy
         *
         * Scroll (in the Wix site) to a relative offset - vertical & horizontal
         *
         * @since SDK 1.18.0
         * @param x (Number) horizontal offset in pixels
         * @param y (Number) vertical offset in pixels
         */
        scrollBy: function(x, y) {
            var args = {
                x : x,
                y: y
            };
            _w.sendMessageInternal2(_w.MessageTypes.SCROLL_BY, args);
        },
        /**
         * Function getBoundingRect
         *
         * Returns the app bounding rect and offset inside the site/viewport
         *
         * @param callback (Function) a callback function which passes back the bounding rect and offsets
         */
        getBoundingRectAndOffsets: function(callback) {
            _w.sendMessageInternal2(_w.MessageTypes.BOUNDING_RECT_AND_OFFSETS, null, callback);
        }
    }
}());
var Wix = Wix || {};

Wix.Styles = (function() {
    var _w;

    return {
        init: function(w) {
            _w = w;
        },
        /**
         * Function getStyleParams
         *
         * Returns the application style parameters which are saved in the site
         *
         * @since SDK 1.26.0
         * @param callback (Function) callback function: function(style) {...}
         * @return (Object) a map describing style parameters by their type. E.g {colors: {bgColor: {value:'#FFFFFF'} }}
         */
        getStyleParams: function(callback){
            return _w.getStyle(callback, 'style');
        },
        /**
         * Function setFontParam
         *
         * Sets a style font parameter in the Wix site
         *
         * @priavte
         * @since SDK 1.26.0
         * @param key (String) a unique key describing a boolean style parameter
         * @param value (Boolean)
         */
        setFontParam: function(key, value){
            _w.setEditorParam('font', key, value);
        },
        /**
         * Function getEditorFonts
         *
         * Returns the list of Wix fonts meta data from the editor
         *
         * @priavte
         * @since SDK 1.26.0
         * @param callback (Function) a callback function to pass the Editor's font
         */
        getEditorFonts: function(callback){
            return _w.getStyle(callback, 'fontsMeta');
        },
        /**
         * Function getSiteTextPresets
         *
         * Returns the list of the text presets from the editor
         *
         * @priavte
         * @since SDK 1.26.0
         * @param callback (Function) a callback function to pass the text presets
         */
        getSiteTextPresets: function(callback){
            return _w.getStyle(callback, 'siteTextPresets');
        },
        /**
         * Function getFontsSpriteUrl
         *
         * Returns the url of the Wix fonts sprite, used to render the font picker
         *
         * @priavte
         * @since SDK 1.26.0
         * @param callback (Function) a callback function to pass the sprite url
         */
        getFontsSpriteUrl: function(callback){
            return _w.getStyle(callback, 'fontsSpriteUrl');
        },
        /**
         * Function getStyleFontByKey
         *
         * Returns style font by a unique key
         *
         * @priavte
         * @since SDK 1.26.0
         * @param fontKey (String) font key
         * @return (Object)
         */
        getStyleFontByKey: function(fontKey){
            var font = _w.Styles.mappedFonts && _w.Styles.mappedFonts['style.' + fontKey];
            return font;
        },
        /**
         * Function getStyleFontByReference
         *
         * Returns a style font by it's refrence name
         *
         * @priavte
         * @since SDK 1.26.0
         * @param fontReference (String) font reference, e.g. 'Title'
         * @return (Object)
         */
        getStyleFontByReference: function(fontReference) {
            return  _w.Styles.siteTextPresets && _w.Styles.siteTextPresets[fontReference];
        },
        /**
         * Function getSiteColors
         *
         * Returns the currently active site colors
         *
         * @since SDK 1.26.0
         * @param callback (Function) callback function: function(colors) {...}
         */
        getSiteColors: function(callback) {
            return _w.getStyle(callback, 'siteColors');
        },
        /**
         * Function getStyleColorByKey
         *
         * Returns the css color value of saved style parameter
         *
         * @priavte
         * @since SDK 1.26.0
         * @param colorKey (String) a unique key describing a color style parameter
         * @return (String) css color string. E.g "#FFFFFF" or "rgba(0,0,0,0.5)"
         */
        getStyleColorByKey: function(colorKey){
            var color = _w.Styles.mappedColors && _w.Styles.mappedColors['style.' + colorKey];
            return color ? color.value : '';
        },
        /** Function getColorByreference
         *
         * Returns the color object of editor style
         *
         * @priavte
         * @since SDK 1.26.0
         * @param colorReference (String) a unique key describing a theme color parameter
         * @return (Object) a map describing a Wix style color. E.g  {value: "#FFFFFF", reference: "color-1"}
         */
        getColorByreference: function(colorReference) {
            var color = _w.Styles.mappedColors && _w.Styles.mappedColors[colorReference];
            color = _w.shallowCloneObject(color, ['name']);
            return color;
        },
        /**
         * Function setColorParam
         *
         * Sets a style color parameter
         *
         * @priavte
         * @since SDK 1.26.0
         * @param key (String) a unique key describing a color style parameter
         * @param value (Object) E.g {value: '#FFFFFF', reference: 'color-1'}
         */
        setColorParam: function(key, value){
            if(value.hasOwnProperty('reference') && value.reference){
                value.color = this.getColorByreference(value.reference);
            }
            _w.setEditorParam('color', key, value);
        },
        /**
         * Function setNumberParam
         *
         * Sets a style number parameter
         *
         * @priavte
         * @since SDK 1.22.0
         * @param key (String) a unique key describing a number style parameter
         * @param value (Number)
         */
        setNumberParam: function(key, value){
            _w.setEditorParam('number', key, value);
        },
        /**
         * Function setBooleanParam
         *
         * Sets a style boolean parameter
         *
         * @priavte
         * @since SDK 1.22.0
         * @param key (String) a unique key describing a boolean style parameter
         * @param value (Boolean)
         */
        setBooleanParam: function(key, value){
            _w.setEditorParam('boolean', key, value);
        }
    }
})();
var Wix = Wix || {};

Wix.Settings = (function () {
    var _w;

    return {
        init: function(w) {
            _w = w;
        },
        /**
         * Wix Media type used by the openMediaDialog function
         */
        MediaType: {
            /* Image media type */
            IMAGE:  'photos',
                /* Background media type */
                BACKGROUND: 'backgrounds',
                /* Audio media type */
                AUDIO:  'audio',
                /* Document media type */
                DOCUMENT: 'documents',
                /* FLASH media type */
                SWF: 'swf'
        },
        /** Function getStyleParams
         *
         * Returns the application style parameters which are saved in the site
         *
         * @deprecated
         * @since SDK 1.22.0
         * @param callback (Function) callback function: function(style) {...}
         * @return (Object) a map describing style parameters by their type. E.g {colors: {bgColor: {value:'#FFFFFF'} }}
         */
        getStyleParams: function(callback){
            _w.reportSdkMsg('Wix.Settings.getStyleParams is DEPRECATED use Wix.Styles.getStyleParams');
            return Wix.Styles.getStyleParams(callback);
        },
        /** Function getStyleColorByKey
         *
         * Returns the css color value of saved style parameter
         *
         * @deprecated
         * @since SDK 1.22.0
         * @param colorKey (String) a unique key describing a color style parameter
         * @return (String) css color string. E.g "#FFFFFF" or "rgba(0,0,0,0.5)"
         */
        getStyleColorByKey: function(colorKey){
            _w.reportSdkMsg('Wix.Settings.getStyleColorByKey is DEPRECATED use Wix.Styles.getStyleColorByKey');
            return Wix.Styles.getStyleColorByKey(colorKey);
        },
        /** Function getColorByreference
         *
         * Returns the color object of editor style
         *
         * @deprecated
         * @since SDK 1.22.0
         * @param colorReference (String) a unique key describing a theme color parameter
         * @return (Object) a map describing a Wix style color. E.g  {value: "#FFFFFF", reference: "color-1"}
         */
        getColorByreference: function(colorReference) {
            _w.reportSdkMsg('Wix.Settings.getColorByreference is DEPRECATED use Wix.Styles.getColorByreference');
            return Wix.Styles.getColorByreference(colorReference);
        },
        /** Function setColorParam
         *
         * Sets a style color parameter
         *
         * @deprecated
         * @since SDK 1.22.0
         * @param key (String) a unique key describing a color style parameter
         * @param value (Object) E.g {value: '#FFFFFF', reference: 'color-1'}
         */
        setColorParam: function(key, value){
            _w.reportSdkMsg('Wix.Settings.setColorParam is DEPRECATED use Wix.Styles.setColorParam');
            return Wix.Styles.setColorParam(key, value);
        },
        /** Function setNumberParam
         *
         * Sets a style number parameter
         *
         * @deprecated
         * @since SDK 1.22.0
         * @param key (String) a unique key describing a number style parameter
         * @param value (Number)
         */
        setNumberParam: function(key, value){
            _w.reportSdkMsg('Wix.Settings.setNumberParam is DEPRECATED use Wix.Styles.setNumberParam');
            return Wix.Styles.setNumberParam(key, value);
        },
        /** Function setBooleanParam
         *
         * Sets a style boolean parameter
         *
         * @deprecated
         * @since SDK 1.22.0
         * @param key (String) a unique key describing a boolean style parameter
         * @param value (Boolean)
         */
        setBooleanParam: function(key, value){
            _w.reportSdkMsg('Wix.Settings.setBooleanParam is DEPRECATED use Wix.Styles.setBooleanParam');
            return Wix.Styles.setBooleanParam(key, value);
        },
        /** Function getSiteColors
         *
         * Returns the currently active site colors
         *
         * @deprecated
         * @since SDK 1.12.0
         * @param callback (Function) callback function: function(colors) {...}
         */
        getSiteColors: function(callback) {
            _w.reportSdkMsg('Wix.Settings.getSiteColors is DEPRECATED use Wix.Styles.getSiteColors');
            return Wix.Styles.getSiteColors(callback);
        },
        /** Function getSiteInfo
         *
         * Returns the site information in a callback function
         *
         * @since SDK 1.12.0
         * @param onSuccess (Function) callback function: function(params) {...}
         */
        getSiteInfo: function(onSuccess) {
            Wix.getSiteInfo(onSuccess);
        },

        /** Function refreshAppByCompIds
         *
         * Refresh all app's components
         *
         * @since SDK 1.12.0
         * @param queryParams
         */
        refreshApp: function(queryParams) {
            this.refreshAppByCompIds(null, queryParams);
        },

        /** Function refreshAppByCompIds
         *
         * Refresh a specific app's component
         *
         * @since SDK 1.12.0
         * @param compIds (String) a component id
         * @param queryParams (String) custom query parameters to pass to the component
         */
        refreshAppByCompIds: function(compIds, queryParams) {
            _w.sendMessageInternal2(_w.MessageTypes.REFRESH_APP, {'queryParams':queryParams, 'compIds':compIds});
        },

        /** Function openBillingPage
         *
         * @since SDK 1.13.0
         * Opens the Wix billing page in a new tab/window
         */
        openBillingPage: function() {
            _w.sendMessageInternal2(_w.MessageTypes.OPEN_BILLING_PAGE);
        },

        /** Function openMediaDialog
         *
         * Opens the Wix media dialog and let's the site owner choose a file from the
         * Wix collection, or upload a new file instead.
         *
         * @since SDK 1.17.0
         * @param mediaType (MediaType enum) use one of the MediaType enum values
         * @param multipleSelection (Boolean) selection mode, single/false or multiple/true item to choose
         * @param onSuceess (Function) callback function: function(data) {...} where the data schema is:
         *          fileName (String) - media item title
         *          type (String) - e.g. 'Image', 'AudioPlayer'
         *          relativeUri (String) -  media item uri (relative to Wix media gallery) use Wix.Utils.Media.get* to get an actual url
         *          width - media type width (for images)
         *          height - media type height (for images)
         */
        openMediaDialog: function(mediaType, multipleSelection, onSuccess) {
            if (!onSuccess) {
                return;
            }
            mediaType = mediaType || this.MediaType.IMAGE;
            multipleSelection = multipleSelection || false;

            _w.sendMessageInternal2(_w.MessageTypes.OPEN_MEDIA_DIALOG, {'mediaType':mediaType, 'multiSelection': multipleSelection}, onSuccess);
        },

        /**
         * Function triggerSettingsUpdatedEvent
         *
         * Sends a message (json object) to a specific app components or to all the app components
         * This API is inspired by HTML5 iframe messages - https://developer.mozilla.org/en-US/docs/DOM/window.postMessage
         *
         * @since 1.17.0
         * @param message (Object,Optional) a custom json object representing a message
         * @param compId (String,Optional) component id to sent message or '*' (default) to send the message to all the app's components
         */
        triggerSettingsUpdatedEvent: function(message, compId) {
            message = message || {};
            compId = compId || '*';

            _w.sendMessageInternal2(_w.MessageTypes.POST_MESSAGE, {'message':message, 'compId': compId});
        },

        /**
         * Function getSitePages
         *
         * Returns the pages which are used in hosting site by name
         *
         * @since 1.17.0
         * @param callback (Function) a callback function that returns the site pages
         *   callback signature: function(data) {}
         *   data signature: { pages: ['page1', 'page2', 'myPage', ...]}
         */
        getSitePages: function(callback) {
            _w.sendMessageInternal2(_w.MessageTypes.GET_SITE_PAGES, null, callback);
        },

        /**
         * Set window placement for a widget
         *
         * @param compId (String) component id to change placement to
         * @param placement (Wix.WindowPlacement enum) new placement for the widget window
         * @param verticalMargin (Number) vertical offset from the placement area
         * @param horizontalMargin (Number) horizontal offset from the placement area
         */
        setWindowPlacement:function (compId, placement, verticalMargin, horizontalMargin) {
            if (!compId || !placement) {
                _w.reportSdkError('Mandatory arguments - compId & placement must be specified');
            }

            if (!Wix.WindowPlacement.hasOwnProperty(placement)) {
                _w.reportSdkError('Invalid argument - placement value should be set using Wix.WindowPlacement');
            }
            _w.sendMessageInternal2(_w.MessageTypes.SET_WINDOW_PLACEMENT, {
                'compId' : compId,
                placement : placement,
                verticalMargin : verticalMargin,
                horizontalMargin : horizontalMargin
            });
        },

        /**
         * Get window placement for a widget
         *
         * @param compId (String) component id to change placement to
         * @param callback (Function) a callback function that returns the component placement
         *   callback signature: function(data) {}
         */
        getWindowPlacement:function (compId, callback) {
            if (!compId || !callback) {
                _w.reportSdkError('Mandatory arguments - compId & callback must be specified');
            }

            _w.sendMessageInternal2(_w.MessageTypes.GET_WINDOW_PLACEMENT, {'compId': compId}, callback);
        }
    }
})();
var Wix = Wix || {};

Wix.Utils = (function() {
    var _w;

    return {
        init: function(w) {
            _w = w;
        },
        /**
         * Function getCompId
         *
         * @since SDK 1.12.0
         * @return (String) the widget/section/settings iframe's component id
         */
        getCompId: function(){
            _w.trackSDKCall("Utils.getCompId");
            return _w.compId;
        },

        /**
         * Function getOrigCompId
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns origCompId parameter value, otherwise returns null
         */
        getOrigCompId: function(){
            _w.trackSDKCall("Utils.getOrigCompId");
            return _w.getQueryParameter("origCompId");
        },

        /**
         * Function getViewMode
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns viewMode parameter value, otherwise returns null
         */
        getViewMode: function(){
            _w.trackSDKCall("Utils.getViewMode");
            return (window.top === window) ? 'standalone' :  _w.currentEditMode;
        },

        /**
         * Function getWidth
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns width parameter value, otherwise returns null
         */
        getWidth: function(){
            _w.trackSDKCall("Utils.getWidth");
            return _w.getQueryParameter("width");
        },

        /**
         * Function getLocale
         *
         * @since SDK 1.14.0
         * @return for valid endpoints returns locale parameter value, otherwise returns null
         */
        getLocale: function(){
            _w.trackSDKCall("Utils.getLocale");
            return _w.getQueryParameter("locale");
        },

        /**
         * Function getCacheKiller
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns cacheKiller parameter value, otherwise returns null
         */
        getCacheKiller: function(){
            _w.trackSDKCall("Utils.getCacheKiller");
            return _w.getQueryParameter("cacheKiller");
        },

        /**
         * Function getTarget
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns target parameter value, otherwise returns null
         */
        getTarget: function(){
            _w.trackSDKCall("Utils.getTarget");
            return _w.getQueryParameter("target");
        },

        /**
         * Function getSectionUrl
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns section-url parameter value, otherwise returns null
         */
        getSectionUrl: function(){
            _w.trackSDKCall("Utils.getSectionUrl");
            var sectionUrl = _w.getQueryParameter("section-url");
            return (sectionUrl && sectionUrl.replace(/\?$/, ""));
        },

        /**
         * Function getInstanceId
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns instanceId app instance property value, otherwise returns null
         */
        getInstanceId: function(){
            _w.trackSDKCall("Utils.getInstanceId");
            return _w.getInstanceValue("instanceId");
        },

        /** Function getSignDate
         *
         * @deprecated  As of SDK 1.13.0
         * @return for valid endpoints returns signDate app instance property value, otherwise returns null
         */
        getSignDate: function(){
            _w.trackSDKCall("Utils.getSignDate");
            return _w.getInstanceValue("signDate");
        },

        /**
         * Function getUid
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns uid app instance property value, otherwise returns null
         */
        getUid: function(){
            _w.trackSDKCall("Utils.getUid");
            return _w.getInstanceValue("uid");
        },

        /**
         * Function getPermissions
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns permissions app instance property value, otherwise returns null
         */
        getPermissions: function(){
            _w.trackSDKCall("Utils.getPermissions");
            return _w.getInstanceValue("permissions");
        },

        /**
         * Function getIpAndPort
         *
         * @deprecated  As of SDK 1.13.0
         * @return for valid endpoints returns ipAndPort app instance property value, otherwise returns null
         */
        getIpAndPort: function(){
            _w.trackSDKCall("Utils.getIpAndPort");
            return _w.getInstanceValue("ipAndPort");
        },

        /**
         * Function getDemoMode
         *
         * @since SDK 1.12.0
         * @return for valid endpoints returns demoMode app instance property value, otherwise returns null
         */
        getDemoMode: function(){
            _w.trackSDKCall("Utils.getDemoMode");
            var mode = _w.getInstanceValue("demoMode");
            mode = (mode == null) ? false : mode;

            return mode;
        },

        /**
         * Function getDeviceType
         *
         * @since SDK 1.20.0
         * @return device
         */
        getDeviceType: function() {
            _w.trackSDKCall("Utils.getDeviceType");
            return _w.getQueryParameter("deviceType") || "desktop";
        },

        /**
         * Function toWixDate
         *
         * Converts a JavaScript Date object into the correct format, ISO 8601, used by Wix APIs when dealing with dates.
         * It follows the same example provided by Mozilla as a polyfill for non-ECMA 262, 5th edition browsers.
         *
         * @since SDK 1.28.0
         * @return A String represenst the given date formatted in ISO 8601.
         */
        toWixDate: function(date) {
            _w.trackSDKCall("Utils.toWixDate");
            return date.toISOString();
        },

        Media: {
            /**
             * Function getImageUrl
             *
             * Returns a url for the image in it's original dimensions (width, height)
             *
             * @since SDK 1.17.0
             * @param relativeUrl (String) static image url provided by the media dialog
             * @return url (String)
             */
            getImageUrl: function(relativeUrl) {
                _w.trackSDKCall("Utils.Media.getImageUrl");

                return 'http://static.wix.com/media/' + relativeUrl;
            },

            /**
             * Function getResizedImageUrl
             *
             * Resize image and apply sharpening (if available) see details here
             * http://en.wikipedia.org/wiki/Unsharp_masking
             *
             * @since SDK 1.17.0
             * @param relativeUrl (String) static image url provided by the media dialog
             * @param width (Number) desired image width
             * @param height (Number) desired image height
             * @param sharpParams (Object, optional)
             *          quality - JPEG quality, leave as is (75) unless image size is important for your app
             *          resizaFilter - resize filter
             *          usm_r - unsharp mask radius
             *          usm_a - unsharp mask amount (precentage)
             *          usm_t - unsharp mask threshold
             *
             * @return url (String)
             */
            getResizedImageUrl: function(relativeUrl, width, height, sharpParams) {
                _w.trackSDKCall("Utils.Media.getResizedImageUrl");

                // assign sharp default parameters
                sharpParams = sharpParams || {};
                sharpParams.quality = sharpParams.quality || 75;
                sharpParams.resizaFilter = sharpParams.resizaFilter || 22;
                sharpParams.usm_r = sharpParams.usm_r || 0.50;
                sharpParams.usm_a = sharpParams.usm_a || 1.20;
                sharpParams.usm_t = sharpParams.usm_t || 0.00;

                var urlArr = [];
                var splitUrl = /[.]([^.]+)$/.exec(relativeUrl);
                var ext = (splitUrl && /[.]([^.]+)$/.exec(relativeUrl)[1]) || "";

                // build the image url
                relativeUrl = 'http://static.wix.com/media/' + relativeUrl;
                urlArr.push(relativeUrl);
                urlArr.push("srz");
                urlArr.push(width);
                urlArr.push(height);

                // sharpening parameters
                urlArr.push(sharpParams.quality);
                urlArr.push(sharpParams.resizaFilter);
                urlArr.push(sharpParams.usm_r);
                urlArr.push(sharpParams.usm_a);
                urlArr.push(sharpParams.quality);

                urlArr.push(ext); // get file extension
                urlArr.push("srz");

                return urlArr.join('_');
            },

            /**
             * Function getAudioUrl
             *
             * @since SDK 1.17.0
             * @param relativeUrl (String) static image url provided by the media dialog
             * @return url (String)
             */
            getAudioUrl: function(relativeUrl) {
                _w.trackSDKCall("Utils.Media.getAudioUrl");

                return 'http://media.wix.com/mp3/' + relativeUrl;
            },

            /**
             * Function getDocumentUrl
             *
             * @since SDK 1.17.0
             * @param relativeUrl (String) static image url provided by the media dialog
             * @return url (String)
             */
            getDocumentUrl: function(relativeUrl) {
                _w.trackSDKCall("Utils.Media.getDocumentUrl");

                return 'http://media.wix.com/ugd/' + relativeUrl;
            },

            /**
             * Function getSwfUrl
             *
             * @since SDK 1.17.0
             * @param relativeUrl (String) static image url provided by the media dialog
             * @return url (String)
             */
            getSwfUrl: function(relativeUrl) {
                _w.trackSDKCall("Utils.Media.getSwfUrl");

                return 'http://static.wix.com/media/' + relativeUrl;
            }
        }
    }
})();
(function (container) {
    var _w = {
        /**
         * Internal Constants
         */
        version: "1.28.0",

        TPA_INTENT:"TPA",
        EDITOR_PARAM_TYPES   : ['color', 'number', 'boolean', 'font'],
        TPA_PUB_SUB_PREFIX: 'TPA_PUB_SUB_',

        /**
         * SDK message types
         */
        MessageTypes:{
            REFRESH_APP: "refreshApp",
            APP_IS_ALIVE: "appIsAlive",
            APP_STATE_CHANGED: "appStateChanged",
            CLOSE_WINDOW: "closeWindow",
            RESIZE_WINDOW: "resizeWindow",
            SET_WINDOW_PLACEMENT: "setWindowPlacement",
            GET_WINDOW_PLACEMENT: "getWindowPlacement",
            OPEN_POPUP: "openPopup",
            OPEN_MODAL: "openModal",
            OPEN_MEDIA_DIALOG: "openMediaDialog",
            OPEN_BILLING_PAGE: "openBillingPage",
            GET_SITE_PAGES: 'getSitePages',
            GET_SITE_COLORS: 'getSiteColors',
            GET_USER_SESSION: 'getUserSession',
            NAVIGATE_TO_PAGE: 'navigateToPage',
            POST_MESSAGE: 'postMessage',
            HEIGHT_CHANGED: "heightChanged",
            NAVIGATE_TO_STATE: "navigateToState",
            SM_REQUEST_LOGIN: "smRequestLogin",
            SM_CURRENT_MEMBER: "smCurrentMember",
            SITE_INFO: "siteInfo",
            BOUNDING_RECT_AND_OFFSETS: "boundingRectAndOffsets",
            SCROLL_TO: "scrollTo",
            SCROLL_BY: "scrollBy",
            SET_STYLE_PARAM: "setStyleParam",
            GET_STYLE_PARAMS: "getStyleParams",
            REGISTER_EVENT_LISTENER: "registerEventListener",
            REMOVE_EVENT_LISTENER: "removeEventListener",
            PUBLISH: 'publish',
            GET_CONTACT_BY_ID: 'getContactById',
            GET_CONTACTS: 'getContacts',
            CREATE_CONTACT: "createContact",
            GET_ACTIVITY_BY_ID: 'getActivityById',
            GET_ACTIVITIES: 'getActivities',
            POST_ACTIVITY: "postActivity"
        },
		isReady: false,
        /**
         * Registered events callbacks
         */
        EventsCallbacks:{},
        /**
         * Resident component id
         */
        compId: null,
        /**
         * Messages response callback map
         */
        callbacks: {},
        /**
         * callback id
         */
        callId: 1,
        /**
         * Current edit mode state
         */
        currentEditMode: 'site',

        /**
         * SDK initialization function
         */
        init:function () {
            // deploy compatibility script to support modern JS on iOS5,IE8/9
            _w.deployPolyFills();
            // initialize google analytics
            _w.gaInit();
            // initialize error tracking logic
            _w.errorTrackingInit();
             // get our comp id
            _w.compId = _w.getQueryParameter("compId") || "[UNKNOWN]";
            _w.deviceType = _w.getQueryParameter('deviceType') || 'desktop';

            // register post message hub function
            _w.addPostMessageCallback(_w.receiver.bind(_w));
            // initialize edit mode state tracking
            this.currentEditMode = _w.getQueryParameter("viewMode") || this.currentEditMode;
            Wix.addEventListener('EDIT_MODE_CHANGE', function(params) {
                this.currentEditMode = params.editMode;
            }.bind(this));

            // report ready to Wix
            _w.sendMessageInternal2(_w.MessageTypes.APP_IS_ALIVE, {version: _w.getVersion()}, this.initStyle);
        },
        Styles:{
            mappedColors: null,
            siteColors: null,
            style: null,
            siteTextPresets: null,
            fontsMeta: null,
            fontsSpriteUrl: null,
            mappedFonts: null
        },
		setReady: function(){
			_w.isReady = true;
			_w.callReadyQ();
		},
		addToReadyQ: function(action){
			_w.readyQ = _w.readyQ || [];
			_w.readyQ.push(action);
		},
		callReadyQ: function(){
			if(_w.isReady && _w.readyQ){
				for(var i = 0;i < _w.readyQ.length; i++){
					_w.readyQ[i].call(null);
				}
			}
		},
        initStyle: function(params){
            var primeColorsReferences = ['white/black','black/white', 'primery-1', 'primery-2', 'primery-3'];

            function getDevNameForColor(themeEditorName){
                index = +themeEditorName.split('_').pop();
                if(index <= 5){
                    return primeColorsReferences[i];
                } else if(index <= 10) {
                    return '';
                } else {
                    return 'color-' + (index - 10);
                }
            }

            function mapColors(colors, styleColors){
                var colorMap = {};
                var y = 1;
                var index;
                for(var i = 0; i < colors.length; i++){
                    index = +colors[i].name.split('_').pop();
                    if(index <= 5){
                        colors[i].reference = primeColorsReferences[i];
                        colorMap[primeColorsReferences[i]] = colors[i];
                    } else if(index <= 10) {
                        //handle colors from 6-10
                    } else {
                        colors[i].reference = 'color-' + y;
                        colorMap['color-' + y] = colors[i];
                        y++;
                    }
                }
                for(var color in styleColors){
                    if(styleColors.hasOwnProperty(color)){
                        colorMap['style.' + color] = styleColors[color];
                    }
                }
                return colorMap;
            }

            function mapFonts(fonts){
                if(!fonts){return}
                var mappedFonts = {};
                for (var font in fonts){
                    mappedFonts['style.' + font] = fonts[font];
                }
                return mappedFonts;
            }

            function findColor(colors,name){
                return colors.filter(function(color){
                    return name === color.name;
                }).pop() || {value:'',name:''};
            }

            function evalTemplate(str, data, getter){
                getter = getter || function(data, key){return data[key];};
                return str.replace(/\{\{([^}]+)\}\}/gmi, function(fullmatch, key){
                    var val = fullmatch;
                    var keysInFallbackOrder = key.split(/\s+/);

                    for(var i = 0; i < keysInFallbackOrder.length; i++){
                        if(keysInFallbackOrder.length === 0){
                            continue;
                        }
                        try {
                            val = getter(data, keysInFallbackOrder[i]);
                            if(val !== undefined){
                                return val;
                            } else if(i === (keysInFallbackOrder.length - 1)){
                                return keysInFallbackOrder[i];
                            }
                        } catch(e) {
                            try{
                                console.log('Warning: could not find key "' + keysInFallbackOrder[i] + '" for match "' + fullmatch + '"');
                            }catch(err){}
                        }
                    }
                    return fullmatch;
                });
            }

            function findEndOfMediaQueryIndex(startIndex, styleTpl){
                var memIndex = 0;
                var index = startIndex;
                var currentChar;
                for (; index < styleTpl.length; index++) {
                    currentChar = styleTpl.charAt(index);
                    if (currentChar === '{') {
                        memIndex += 1;
                    }
                    if (currentChar === '}') {
                        memIndex -= 1;
                    }
                    if (memIndex < 0) {
                        index++;
                        break;
                    }
                }
                return index;
            }

            function applyWixMediaQuery(cssText, currentMediaType) {
                var
                    endIndex,
                    id,
                    start,
                    end,
                    mediaQuery,
                    match,
                    panic = 100000,
                    rndId = Math.random(),
                    mediaRegExp = /@media\s*\(\s*wix-device-type\s*:\s*(\w+)\s*\)\s*\{/m,
                    mediaQueries = [];

                while (true) {
                    if(panic-- < 0){ return mediaQueries;}

                    match = cssText.match(mediaRegExp);

                    if (match) {

                        endIndex = findEndOfMediaQueryIndex(match.index + match[0].length, cssText);

                        id = '/*** wix-media '+rndId+'$'+mediaQueries.length+' ***/';

                        mediaQuery = cssText.slice(match.index, endIndex);

                        cssText = cssText.replace(mediaQuery, id);

                        start = mediaQuery.indexOf('{');
                        end = mediaQuery.lastIndexOf('}');

                        mediaQueries.push({
                            id: id,
                            mediaQuery : mediaQuery.slice(start + 1, end - 1),
                            mediaType: match[1]
                        });

                    } else {
                        break;
                    }
                }

                mediaQueries.forEach(function(media){
                    if(media.mediaType === currentMediaType){
                        cssText = cssText.replace(media.id, media.id + media.mediaQuery);
                    } else {
                        cssText = cssText.replace(media.id, '');
                    }
                });

                return cssText;
            }

            function getValueForTemplate(styles, keyName){
                return (styles.mappedColors    ? styles.mappedColors[keyName]    ? styles.mappedColors[keyName].value    : undefined : undefined) ||
                       (styles.mappedFonts     ? styles.mappedFonts[keyName]     ? styles.mappedFonts[keyName].value     : undefined : undefined) ||
                       (styles.siteTextPresets ? styles.siteTextPresets[keyName] ? styles.siteTextPresets[keyName].value : undefined : undefined);
            }

            function updateStyleElement(ownerNode){
                if(ownerNode && ownerNode.hasAttribute('wix-style')){
                    if(!ownerNode._wixTemplate){
                        if(ownerNode.nodeName.toLowerCase() === 'link'){
                            throw new Error('"wix-style" is not supported on link elements, use inline style inside the document head');
                        } else {
                            ownerNode._wixTemplate = ownerNode.textContent;
                        }
                    }
                    ownerNode.textContent = evalTemplate(applyWixMediaQuery(ownerNode._wixTemplate, Wix.Utils.getDeviceType()), _w.Styles, getValueForTemplate);
                }
            }

            function updateCSSStyleSheets(){
                var styles = document.getElementsByTagName('style'); //document.styleSheets
                for(var i = 0; i < styles.length; i++){
                    updateStyleElement(styles[i]);
                }
            }

            function createInjectedStyleElement(){
                var head = document.getElementsByTagName('head')[0];
                var text = ".Title{ {{Title}} } .Menu{ {{Menu}} } .Page-title{ {{Page-title}} } .Heading-XL{ {{Heading-XL}} } .Heading-L{ {{Heading-L}} } .Heading-M{ {{Heading-M}} } .Heading-S{ {{Heading-S}} } .Body-L{ {{Body-L}} } .Body-M{ {{Body-M}} } .Body-S{ {{Body-S}} } .Body-XS{ {{Body-XS}} } }";
                head.insertAdjacentHTML('afterbegin', '<' + 'sty' + 'le wix-style type="text/css">'+text+'</' + 'sty' + 'le>');
            }

            function setReferencesForSavedStyles(style){
                for(var prop in style.colors){
                    var color = style.colors[prop];
                    if(!color.themeName){continue;}
                    var editorIndex = +color.themeName.split('_').pop()
                    if(editorIndex <= 5){
                        color.themeName = primeColorsReferences[editorIndex-1]
                    } else if(editorIndex <= 10){

                    } else {
                        color.themeName = 'color-' + (editorIndex - 10);
                    }
                }
                return style;
            }

            function updateStylesCache(params){
                cacheGoogleFontsCssUrl(params.style);
                handleFonts(params.fonts);
                _w.Styles.siteColors = params.siteColors || _w.Styles.siteColors;
                _w.Styles.siteTextPresets = params.siteTextPresets || _w.Styles.siteTextPresets;
                _w.Styles.fontsMeta = extractFontsMeta(params.fonts) || _w.Styles.fontsMeta;
                _w.Styles.style = params.style ? setReferencesForSavedStyles(params.style) : _w.Styles.style;
                _w.Styles.mappedColors = mapColors(_w.Styles.siteColors, _w.Styles.style.colors);
                _w.Styles.mappedFonts =  mapFonts(_w.Styles.style.fonts);
            }

            function extractFontsMeta(fonts){
                if(!fonts){return null;}
                return fonts.fontsMeta;
            }

            function appendLinkToHead(url, id){
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('link');
                link.setAttribute('type', 'text/css');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', url);
                if(typeof id === 'string') {link.id = id;}
                head.appendChild(link);
                return link;
            }

            function updateGoogleFontsLink(url){
                var elToRemove;
                if(!url){return;}
                if(updateGoogleFontsLink.$linkElement && updateGoogleFontsLink.$linkElement.getAttribute('href') === url){
                    return;
                } else if(updateGoogleFontsLink.$linkElement){
                    elToRemove = updateGoogleFontsLink.$linkElement;
                    setTimeout(function(){
                        elToRemove.parentNode && elToRemove.parentNode.removeChild(elToRemove);
                        elToRemove = null;
                    },5000);
                }
                updateGoogleFontsLink.$linkElement = appendLinkToHead(url, 'wix-google-fonts');
            }

            function cacheGoogleFontsCssUrl(fonts){
                return _w.Styles.googleFontsCssUrl = fonts && fonts.googleFontsCssUrl || _w.Styles.googleFontsCssUrl;
            }


            Wix.addEventListener(Wix.Events.THEME_CHANGE, function(params) {
                updateStylesCache(params);
                _w.callEventListeners({
                    params: _w.Styles.style,
                    eventType: Wix.Events.STYLE_PARAMS_CHANGE
                }, 'internal');
            });

            Wix.addEventListener(Wix.Events.STYLE_PARAMS_CHANGE, function(params, typeOfCall) {
                if(typeOfCall !== 'internal') {
                    updateStylesCache({style:params});
                }
                updateGoogleFontsLink(_w.Styles.googleFontsCssUrl);
                updateCSSStyleSheets();
            });

            function handleFonts(fonts){
                if(!fonts){return;}
                var links = document.getElementsByTagName('link');
                fonts.cssUrls.forEach(function(url){
                    for(var i = 0; i < links.length; i++){
                        if(links[i].getAttribute('href') === url){
                            return;
                        }
                    }
                    appendLinkToHead(url);
                });
                _w.Styles.fontsSpriteUrl = fonts.imageSpriteUrl;
            }

            createInjectedStyleElement();
            updateStylesCache(params);
            updateGoogleFontsLink(_w.Styles.googleFontsCssUrl);
            updateCSSStyleSheets();

			_w.setReady();
        },
        getStyle: function(callback, key) {
            if(_w.Styles[key]){
                callback && callback(_w.Styles[key]);
            } else {
                _w.addToReadyQ(function(){
                    callback && callback(_w.Styles[key]);
                });
            }
            return _w.Styles[key];
        },

        setEditorParam: function(type, key, value){
            if(_w.EDITOR_PARAM_TYPES.indexOf(type) === -1){
                _w.reportSdkError('Invalid editor param type: "' + type + '"');
            }
            if(!key){
                _w.reportSdkError('Invalid key name');
            }
            _w.sendMessageInternal2(_w.MessageTypes.SET_STYLE_PARAM, {
                type: type,
                key: key,
                param: value
            });
        },
        reportSdkError: function(errorMessage) {
            var error = new Error('Wix SDK: ' + errorMessage);
            throw error.stack;
        },
        reportSdkMsg: function(message) {
           var msg = new Error('Wix SDK: ' + message);
           window.console && window.console.log && window.console.log(msg.stack.replace('Error:', ''));
        },
        /**
         * Internal Functions
         */
        sendMessageInternal:function (type, data) {
            var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
            if (target && typeof target != "undefined") {
                target.postMessage(JSON.stringify({
                    intent:_w.TPA_INTENT,
                    deviceType: _w.deviceType,
                    compId:_w.compId,
                    type:type,
                    data:data
                }), "*");

                var dataStr = "";
                try {
                    dataStr = JSON.stringify(data);
                } catch(err) {}
                _w.trackSDKCall(type, dataStr);
            }
        },

        sendMessageInternal2:function (msgType, params, callback) {
            if (!msgType) {
                return;
            }

            /* prepare call parameters */
            var blob = _w.getBlob(msgType, params, callback);

            var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
            if (target && typeof target != "undefined") {
                var dataStr = "";
                try {
                    dataStr = JSON.stringify(params);
                } catch(err) {
                    // ...
                }

                target.postMessage(JSON.stringify(blob),"*");

                _w.trackSDKCall(msgType, dataStr);
            }
        },
        removeEventListenerInternal: function(eventName, callBackOrId, skipValidation) {
            if (!skipValidation && (!eventName || !Wix.Events.hasOwnProperty(eventName))) {
                _w.reportSdkError('Unsupported event name, ' + eventName);
                return;
            }
            var i = -1;
            var eventCallbacks = _w.EventsCallbacks[eventName];
            if(eventCallbacks){
                for(var y = 0; y < eventCallbacks.length; y++){
                    if(eventCallbacks[y].callback === callBackOrId || eventCallbacks[y].id === callBackOrId){
                        i = y;
                        break;
                    }
                }
                if(i !== -1){
                    eventCallbacks.splice(i, 1);
                }
            }
            if(i >= 0 && eventCallbacks.length === 0){
                _w.sendMessageInternal2(_w.MessageTypes.REMOVE_EVENT_LISTENER, eventName);
            }
        },
        addEventListenerInternal: function(eventKey, callBack, skipValidation, params) {
            if (!skipValidation && (!eventKey || !Wix.Events.hasOwnProperty(eventKey))) {
                _w.reportSdkError('Unsupported event name, ' + eventKey);
                return;
            }
            var id = this.getCallId();

            _w.EventsCallbacks[eventKey] = _w.EventsCallbacks[eventKey] || [];
            _w.EventsCallbacks[eventKey].push({
                callback: callBack,
                id: id
            });

            //params can be used as override params for the event to add more functionality
            params = params || {};
            params.eventKey = eventKey;

            _w.sendMessageInternal2(_w.MessageTypes.REGISTER_EVENT_LISTENER, params, _w.handleAddEventListenerResponse.bind(null, callBack));
            return id;
        },
        handleAddEventListenerResponse:function(callback, event){
            if(event.drain){
                event.data.forEach(function(data){
                    callback(data);
                }, null);
            }
        },
        getBlob: function(msgType, params, onResponseCallback) {
            var blob = {
                intent: "TPA2",
                callId: this.getCallId(),
                type: msgType,
                compId: _w.compId,
                deviceType: _w.deviceType,
                data: params
            };

            if (onResponseCallback) {
                this.callbacks[blob.callId] = onResponseCallback;
            }

            return blob;
        },

        getCallId: function() {
            return _w.callId++;
        },

        addPostMessageCallback:function (callback) {
            if (window.addEventListener) {
                window.addEventListener('message', callback, false);
            } else if (window.attachEvent) {
                window.attachEvent('onmessage', callback);
            }
        },

        getQueryParameter:function (parameterName) {
            if (!_w.queryMap) {
                _w.queryMap = {};
                var queryString = location.search.substring(1) || '';
                var queryArray = queryString.split('&');

                queryArray.forEach(function(element) {
                    var parts = element.split('=');
                    _w.queryMap[parts[0]] = decodeURIComponent(parts[1]);
                });
            }
            return _w.queryMap[parameterName] || null;
        },

        decodeBase64: function(str) {
            return atob(str);
        },

        getVersion: function() {
            var version = !!_w.version ? _w.version : (window.location.pathname.split('/')[3] || "unknown");

            return version;
        },

        gaInit: function() {
            var _gaq = window._gaq || ( window._gaq = []);
            _gaq.push(['wix._setAccount', 'UA-2117194-51']);
            _gaq.push(['wix._trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();
        },

        errorTrackingInit: function() {
            var event = 'onerror';
            var listener =  _w.errorHandler;

            if (window.addEventListener) {
                window.addEventListener(event.replace(/^on/, ''), listener, false);
            } else {
                if (window[event]) {
                    var origListener = window[event];
                    window[event] = function(event) {
                        origListener(event);
                        listener(event);
                    }
                } else {
                    window[event] = function(event) {
                        listener(event);
                    }
                }
            }
        },

        errorHandler: function(errorMsg, url, lineNumber) {
            _w.trackError(errorMsg, lineNumber);

            return false;
        },

        /** Function trackEvent
         *
         * Add an event tracking
         *
         * @param category (String) name for the group of objects you want to track.
         * @param action (String) action name, unique in the category scope used to define the type of user interaction.
         * @param label (String) Optional, provides additional dimensions to the event data
         * @param value (Number) Optional, provides numerical data about the user event
         */
        gaTrackEvent: function(category, action, label, value) {
            _gaq.push(['wix._trackEvent', category || "default", action || "default", label || "", value]);
        },

        trackSDKCall: function(callName, label) {
            _w.gaTrackEvent("SDK", callName, label);
        },

        trackEventCall: function(eventName) {
            _w.gaTrackEvent("Event", eventName);
        },

        trackError: function(errorMessage) {
            _w.gaTrackEvent("Error", errorMessage);
        },

        getDecodedInstance: function() {
            var instanceStr = _w.getQueryParameter("instance");
            var encodedInstance = instanceStr.substring(instanceStr.indexOf(".")+1);
            return JSON.parse(this.decodeBase64(encodedInstance));
        },

        getInstanceValue: function(key) {
            var decodedInstance = _w.getDecodedInstance();
            if (decodedInstance) {
                return decodedInstance[key] || null;
            }
            return null;
        },
        shallowCloneObject: function(obj, ignoreKeys){
            var newObj = newObj || {};
            for (var p in obj){
                if(obj.hasOwnProperty(p) && ignoreKeys.indexOf(p) === -1){
                    newObj[p] = obj[p];
                }
            }
            return newObj;
        },
        receiver:function (event) {
            if (!event || !event.data) {
                return;
            }

            var data = {};
            try {
                data = JSON.parse(event.data);
            } catch(e) {
                return;
            }

            switch(data.intent) {
                case "TPA_RESPONSE":
                    if (data.callId && this.callbacks[data.callId]) {
                        this.callbacks[data.callId](data.res);
                        delete this.callbacks[data.callId];
                    }
                    break;

                case "addEventListener":
                    this.callEventListeners(data);
                    break;
            }
        },
        callEventListeners: function(data, typeOfCall){
            _w.trackEventCall(data.eventType);
            if (this.EventsCallbacks[data.eventType]) {
                this.EventsCallbacks[data.eventType].forEach(function (callbackHandler) {
                    callbackHandler.callback.call(this, data.params, typeOfCall);
                });
            }
        },

        deployPolyFills: function() {
            this.deployES5Shim();
            this.deployBase64PolyFill();
            this.deployTextContentPolyFill();
            this.deployISODatePolyFill();
        },
        deployTextContentPolyFill : function () {
            if (Object.defineProperty && Object.getOwnPropertyDescriptor &&
                Object.getOwnPropertyDescriptor(Element.prototype, "textContent") &&
                !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get)
                (function () {
                    var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
                    Object.defineProperty(Element.prototype, "textContent", { // It won't work if you just drop in innerText.get
                        // and innerText.set or the whole descriptor.
                        get : function () {
                            return innerText.get.call(this)
                        },
                        set : function (x) {
                            return innerText.set.call(this, x)
                        }
                    });
                })();
        },
        deployBase64PolyFill: function() {
            // minified source at https://github.com/davidchambers/Base64.js
            var t="undefined"!=typeof window?window:exports,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n=function(){try{document.createElement("$")}catch(t){return t}}();t.btoa||(t.btoa=function(t){for(var o,e,a=0,c=r,f="";t.charAt(0|a)||(c="=",a%1);f+=c.charAt(63&o>>8-8*(a%1))){if(e=t.charCodeAt(a+=.75),e>255)throw n;o=o<<8|e}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),1==t.length%4)throw n;for(var o,e,a=0,c=0,f="";e=t.charAt(c++);~e&&(o=a%4?64*o+e:e,a++%4)?f+=String.fromCharCode(255&o>>(6&-2*a)):0)e=r.indexOf(e);return f;});
        },

        deployES5Shim: function() {
            // minified sham from https://github.com/kriskowal/es5-shim
            (function(definition){if(typeof define=="function"){define(definition)}else if(typeof YUI=="function"){YUI.add("es5",definition)}else{definition()}})(function(){function Empty(){}if(!Function.prototype.bind){Function.prototype.bind=function bind(that){var target=this;if(typeof target!="function"){throw new TypeError("Function.prototype.bind called on incompatible "+target)}var args=_Array_slice_.call(arguments,1);var bound=function(){if(this instanceof bound){var result=target.apply(this,args.concat(_Array_slice_.call(arguments)));if(Object(result)===result){return result}return this}else{return target.apply(that,args.concat(_Array_slice_.call(arguments)))}};if(target.prototype){Empty.prototype=target.prototype;bound.prototype=new Empty;Empty.prototype=null}return bound}}var call=Function.prototype.call;var prototypeOfArray=Array.prototype;var prototypeOfObject=Object.prototype;var _Array_slice_=prototypeOfArray.slice;var _toString=call.bind(prototypeOfObject.toString);var owns=call.bind(prototypeOfObject.hasOwnProperty);var defineGetter;var defineSetter;var lookupGetter;var lookupSetter;var supportsAccessors;if(supportsAccessors=owns(prototypeOfObject,"__defineGetter__")){defineGetter=call.bind(prototypeOfObject.__defineGetter__);defineSetter=call.bind(prototypeOfObject.__defineSetter__);lookupGetter=call.bind(prototypeOfObject.__lookupGetter__);lookupSetter=call.bind(prototypeOfObject.__lookupSetter__)}if([1,2].splice(0).length!=2){var array_splice=Array.prototype.splice;if(function(){function makeArray(l){var a=[];while(l--){a.unshift(l)}return a}var array=[],lengthBefore;array.splice.bind(array,0,0).apply(null,makeArray(20));array.splice.bind(array,0,0).apply(null,makeArray(26));lengthBefore=array.length;array.splice(5,0,"XXX");if(lengthBefore+1==array.length){return true}}()){Array.prototype.splice=function(start,deleteCount){if(!arguments.length){return[]}else{return array_splice.apply(this,[start===void 0?0:start,deleteCount===void 0?this.length-start:deleteCount].concat(_Array_slice_.call(arguments,2)))}}}else{Array.prototype.splice=function(start,deleteCount){var result,args=_Array_slice_.call(arguments,2),addElementsCount=args.length;if(!arguments.length){return[]}if(start===void 0){start=0}if(deleteCount===void 0){deleteCount=this.length-start}if(addElementsCount>0){if(deleteCount<=0){if(start==this.length){this.push.apply(this,args);return[]}if(start==0){this.unshift.apply(this,args);return[]}}result=_Array_slice_.call(this,start,start+deleteCount);args.push.apply(args,_Array_slice_.call(this,start+deleteCount,this.length));args.unshift.apply(args,_Array_slice_.call(this,0,start));args.unshift(0,this.length);array_splice.apply(this,args);return result}return array_splice.call(this,start,deleteCount)}}}if([].unshift(0)!=1){var array_unshift=Array.prototype.unshift;Array.prototype.unshift=function(){array_unshift.apply(this,arguments);return this.length}}if(!Array.isArray){Array.isArray=function isArray(obj){return _toString(obj)=="[object Array]"}}var boxedString=Object("a"),splitString=boxedString[0]!="a"||!(0 in boxedString);if(!Array.prototype.forEach){Array.prototype.forEach=function forEach(fun){var object=toObject(this),self=splitString&&_toString(this)=="[object String]"?this.split(""):object,thisp=arguments[1],i=-1,length=self.length>>>0;if(_toString(fun)!="[object Function]"){throw new TypeError}while(++i<length){if(i in self){fun.call(thisp,self[i],i,object)}}}}if(!Array.prototype.map){Array.prototype.map=function map(fun){var object=toObject(this),self=splitString&&_toString(this)=="[object String]"?this.split(""):object,length=self.length>>>0,result=Array(length),thisp=arguments[1];if(_toString(fun)!="[object Function]"){throw new TypeError(fun+" is not a function")}for(var i=0;i<length;i++){if(i in self)result[i]=fun.call(thisp,self[i],i,object)}return result}}if(!Array.prototype.filter){Array.prototype.filter=function filter(fun){var object=toObject(this),self=splitString&&_toString(this)=="[object String]"?this.split(""):object,length=self.length>>>0,result=[],value,thisp=arguments[1];if(_toString(fun)!="[object Function]"){throw new TypeError(fun+" is not a function")}for(var i=0;i<length;i++){if(i in self){value=self[i];if(fun.call(thisp,value,i,object)){result.push(value)}}}return result}}if(!Array.prototype.every){Array.prototype.every=function every(fun){var object=toObject(this),self=splitString&&_toString(this)=="[object String]"?this.split(""):object,length=self.length>>>0,thisp=arguments[1];if(_toString(fun)!="[object Function]"){throw new TypeError(fun+" is not a function")}for(var i=0;i<length;i++){if(i in self&&!fun.call(thisp,self[i],i,object)){return false}}return true}}if(!Array.prototype.some){Array.prototype.some=function some(fun){var object=toObject(this),self=splitString&&_toString(this)=="[object String]"?this.split(""):object,length=self.length>>>0,thisp=arguments[1];if(_toString(fun)!="[object Function]"){throw new TypeError(fun+" is not a function")}for(var i=0;i<length;i++){if(i in self&&fun.call(thisp,self[i],i,object)){return true}}return false}}if(!Array.prototype.reduce){Array.prototype.reduce=function reduce(fun){var object=toObject(this),self=splitString&&_toString(this)=="[object String]"?this.split(""):object,length=self.length>>>0;if(_toString(fun)!="[object Function]"){throw new TypeError(fun+" is not a function")}if(!length&&arguments.length==1){throw new TypeError("reduce of empty array with no initial value")}var i=0;var result;if(arguments.length>=2){result=arguments[1]}else{do{if(i in self){result=self[i++];break}if(++i>=length){throw new TypeError("reduce of empty array with no initial value")}}while(true)}for(;i<length;i++){if(i in self){result=fun.call(void 0,result,self[i],i,object)}}return result}}if(!Array.prototype.reduceRight){Array.prototype.reduceRight=function reduceRight(fun){var object=toObject(this),self=splitString&&_toString(this)=="[object String]"?this.split(""):object,length=self.length>>>0;if(_toString(fun)!="[object Function]"){throw new TypeError(fun+" is not a function")}if(!length&&arguments.length==1){throw new TypeError("reduceRight of empty array with no initial value")}var result,i=length-1;if(arguments.length>=2){result=arguments[1]}else{do{if(i in self){result=self[i--];break}if(--i<0){throw new TypeError("reduceRight of empty array with no initial value")}}while(true)}if(i<0){return result}do{if(i in this){result=fun.call(void 0,result,self[i],i,object)}}while(i--);return result}}if(!Array.prototype.indexOf||[0,1].indexOf(1,2)!=-1){Array.prototype.indexOf=function indexOf(sought){var self=splitString&&_toString(this)=="[object String]"?this.split(""):toObject(this),length=self.length>>>0;if(!length){return-1}var i=0;if(arguments.length>1){i=toInteger(arguments[1])}i=i>=0?i:Math.max(0,length+i);for(;i<length;i++){if(i in self&&self[i]===sought){return i}}return-1}}if(!Array.prototype.lastIndexOf||[0,1].lastIndexOf(0,-3)!=-1){Array.prototype.lastIndexOf=function lastIndexOf(sought){var self=splitString&&_toString(this)=="[object String]"?this.split(""):toObject(this),length=self.length>>>0;if(!length){return-1}var i=length-1;if(arguments.length>1){i=Math.min(i,toInteger(arguments[1]))}i=i>=0?i:length-Math.abs(i);for(;i>=0;i--){if(i in self&&sought===self[i]){return i}}return-1}}if(!Object.keys){var hasDontEnumBug=true,dontEnums=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],dontEnumsLength=dontEnums.length;for(var key in{toString:null}){hasDontEnumBug=false}Object.keys=function keys(object){if(typeof object!="object"&&typeof object!="function"||object===null){throw new TypeError("Object.keys called on a non-object")}var keys=[];for(var name in object){if(owns(object,name)){keys.push(name)}}if(hasDontEnumBug){for(var i=0,ii=dontEnumsLength;i<ii;i++){var dontEnum=dontEnums[i];if(owns(object,dontEnum)){keys.push(dontEnum)}}}return keys}}var negativeDate=-621987552e5,negativeYearString="-000001";if(!Date.prototype.toISOString||new Date(negativeDate).toISOString().indexOf(negativeYearString)===-1){Date.prototype.toISOString=function toISOString(){var result,length,value,year,month;if(!isFinite(this)){throw new RangeError("Date.prototype.toISOString called on non-finite value.")}year=this.getUTCFullYear();month=this.getUTCMonth();year+=Math.floor(month/12);month=(month%12+12)%12;result=[month+1,this.getUTCDate(),this.getUTCHours(),this.getUTCMinutes(),this.getUTCSeconds()];year=(year<0?"-":year>9999?"+":"")+("00000"+Math.abs(year)).slice(0<=year&&year<=9999?-4:-6);length=result.length;while(length--){value=result[length];if(value<10){result[length]="0"+value}}return year+"-"+result.slice(0,2).join("-")+"T"+result.slice(2).join(":")+"."+("000"+this.getUTCMilliseconds()).slice(-3)+"Z"}}var dateToJSONIsSupported=false;try{dateToJSONIsSupported=Date.prototype.toJSON&&new Date(NaN).toJSON()===null&&new Date(negativeDate).toJSON().indexOf(negativeYearString)!==-1&&Date.prototype.toJSON.call({toISOString:function(){return true}})}catch(e){}if(!dateToJSONIsSupported){Date.prototype.toJSON=function toJSON(key){var o=Object(this),tv=toPrimitive(o),toISO;if(typeof tv==="number"&&!isFinite(tv)){return null}toISO=o.toISOString;if(typeof toISO!="function"){throw new TypeError("toISOString property is not callable")}return toISO.call(o)}}if(!Date.parse||"Date.parse is buggy"){Date=function(NativeDate){function Date(Y,M,D,h,m,s,ms){var length=arguments.length;if(this instanceof NativeDate){var date=length==1&&String(Y)===Y?new NativeDate(Date.parse(Y)):length>=7?new NativeDate(Y,M,D,h,m,s,ms):length>=6?new NativeDate(Y,M,D,h,m,s):length>=5?new NativeDate(Y,M,D,h,m):length>=4?new NativeDate(Y,M,D,h):length>=3?new NativeDate(Y,M,D):length>=2?new NativeDate(Y,M):length>=1?new NativeDate(Y):new NativeDate;date.constructor=Date;return date}return NativeDate.apply(this,arguments)}var isoDateExpression=new RegExp("^"+"(\\d{4}|[+-]\\d{6})"+"(?:-(\\d{2})"+"(?:-(\\d{2})"+"(?:"+"T(\\d{2})"+":(\\d{2})"+"(?:"+":(\\d{2})"+"(?:(\\.\\d{1,}))?"+")?"+"("+"Z|"+"(?:"+"([-+])"+"(\\d{2})"+":(\\d{2})"+")"+")?)?)?)?"+"$");var months=[0,31,59,90,120,151,181,212,243,273,304,334,365];function dayFromMonth(year,month){var t=month>1?1:0;return months[month]+Math.floor((year-1969+t)/4)-Math.floor((year-1901+t)/100)+Math.floor((year-1601+t)/400)+365*(year-1970)}for(var key in NativeDate){Date[key]=NativeDate[key]}Date.now=NativeDate.now;Date.UTC=NativeDate.UTC;Date.prototype=NativeDate.prototype;Date.prototype.constructor=Date;Date.parse=function parse(string){var match=isoDateExpression.exec(string);if(match){var year=Number(match[1]),month=Number(match[2]||1)-1,day=Number(match[3]||1)-1,hour=Number(match[4]||0),minute=Number(match[5]||0),second=Number(match[6]||0),millisecond=Math.floor(Number(match[7]||0)*1e3),offset=!match[4]||match[8]?0:Number(new NativeDate(1970,0)),signOffset=match[9]==="-"?1:-1,hourOffset=Number(match[10]||0),minuteOffset=Number(match[11]||0),result;if(hour<(minute>0||second>0||millisecond>0?24:25)&&minute<60&&second<60&&millisecond<1e3&&month>-1&&month<12&&hourOffset<24&&minuteOffset<60&&day>-1&&day<dayFromMonth(year,month+1)-dayFromMonth(year,month)){result=((dayFromMonth(year,month)+day)*24+hour+hourOffset*signOffset)*60;result=((result+minute+minuteOffset*signOffset)*60+second)*1e3+millisecond+offset;if(-864e13<=result&&result<=864e13){return result}}return NaN}return NativeDate.parse.apply(this,arguments)};return Date}(Date)}if(!Date.now){Date.now=function now(){return(new Date).getTime()}}if(!Number.prototype.toFixed||8e-5.toFixed(3)!=="0.000"||.9.toFixed(0)==="0"||1.255.toFixed(2)!=="1.25"||0xde0b6b3a7640080.toFixed(0)!=="1000000000000000128"){(function(){var base,size,data,i;base=1e7;size=6;data=[0,0,0,0,0,0];function multiply(n,c){var i=-1;while(++i<size){c+=n*data[i];data[i]=c%base;c=Math.floor(c/base)}}function divide(n){var i=size,c=0;while(--i>=0){c+=data[i];data[i]=Math.floor(c/n);c=c%n*base}}function toString(){var i=size;var s="";while(--i>=0){if(s!==""||i===0||data[i]!==0){var t=String(data[i]);if(s===""){s=t}else{s+="0000000".slice(0,7-t.length)+t}}}return s}function pow(x,n,acc){return n===0?acc:n%2===1?pow(x,n-1,acc*x):pow(x*x,n/2,acc)}function log(x){var n=0;while(x>=4096){n+=12;x/=4096}while(x>=2){n+=1;x/=2}return n}Number.prototype.toFixed=function(fractionDigits){var f,x,s,m,e,z,j,k;f=Number(fractionDigits);f=f!==f?0:Math.floor(f);if(f<0||f>20){throw new RangeError("Number.toFixed called with invalid number of decimals")}x=Number(this);if(x!==x){return"NaN"}if(x<=-1e21||x>=1e21){return String(x)}s="";if(x<0){s="-";x=-x}m="0";if(x>1e-21){e=log(x*pow(2,69,1))-69;z=e<0?x*pow(2,-e,1):x/pow(2,e,1);z*=4503599627370496;e=52-e;if(e>0){multiply(0,z);j=f;while(j>=7){multiply(1e7,0);j-=7}multiply(pow(10,j,1),0);j=e-1;while(j>=23){divide(1<<23);j-=23}divide(1<<j);multiply(1,1);divide(2);m=toString()}else{multiply(0,z);multiply(1<<-e,0);m=toString()+"0.00000000000000000000".slice(2,2+f)}}if(f>0){k=m.length;if(k<=f){m=s+"0.0000000000000000000".slice(0,f-k+2)+m}else{m=s+m.slice(0,k-f)+"."+m.slice(k-f)}}else{m=s+m}return m}})()}var string_split=String.prototype.split;if("ab".split(/(?:ab)*/).length!==2||".".split(/(.?)(.?)/).length!==4||"tesst".split(/(s)*/)[1]==="t"||"".split(/.?/).length===0||".".split(/()()/).length>1){(function(){var compliantExecNpcg=/()??/.exec("")[1]===void 0;String.prototype.split=function(separator,limit){var string=this;if(separator===void 0&&limit===0)return[];if(Object.prototype.toString.call(separator)!=="[object RegExp]"){return string_split.apply(this,arguments)}var output=[],flags=(separator.ignoreCase?"i":"")+(separator.multiline?"m":"")+(separator.extended?"x":"")+(separator.sticky?"y":""),lastLastIndex=0,separator=new RegExp(separator.source,flags+"g"),separator2,match,lastIndex,lastLength;string+="";if(!compliantExecNpcg){separator2=new RegExp("^"+separator.source+"$(?!\\s)",flags)}limit=limit===void 0?-1>>>0:limit>>>0;while(match=separator.exec(string)){lastIndex=match.index+match[0].length;if(lastIndex>lastLastIndex){output.push(string.slice(lastLastIndex,match.index));if(!compliantExecNpcg&&match.length>1){match[0].replace(separator2,function(){for(var i=1;i<arguments.length-2;i++){if(arguments[i]===void 0){match[i]=void 0}}})}if(match.length>1&&match.index<string.length){Array.prototype.push.apply(output,match.slice(1))}lastLength=match[0].length;lastLastIndex=lastIndex;if(output.length>=limit){break}}if(separator.lastIndex===match.index){separator.lastIndex++}}if(lastLastIndex===string.length){if(lastLength||!separator.test("")){output.push("")}}else{output.push(string.slice(lastLastIndex))}return output.length>limit?output.slice(0,limit):output}})()}else if("0".split(void 0,0).length){String.prototype.split=function(separator,limit){if(separator===void 0&&limit===0)return[];return string_split.apply(this,arguments)}}if("".substr&&"0b".substr(-1)!=="b"){var string_substr=String.prototype.substr;String.prototype.substr=function(start,length){return string_substr.call(this,start<0?(start=this.length+start)<0?0:start:start,length)}}var ws="        \n\f\r \xa0\u1680\u180e\u2000\u2001\u2002\u2003"+"\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028"+"\u2029\ufeff";if(!String.prototype.trim||ws.trim()){ws="["+ws+"]";var trimBeginRegexp=new RegExp("^"+ws+ws+"*"),trimEndRegexp=new RegExp(ws+ws+"*$");String.prototype.trim=function trim(){if(this===void 0||this===null){throw new TypeError("can't convert "+this+" to object")}return String(this).replace(trimBeginRegexp,"").replace(trimEndRegexp,"")}}function toInteger(n){n=+n;if(n!==n){n=0}else if(n!==0&&n!==1/0&&n!==-(1/0)){n=(n>0||-1)*Math.floor(Math.abs(n))}return n}function isPrimitive(input){var type=typeof input;return input===null||type==="undefined"||type==="boolean"||type==="number"||type==="string"}function toPrimitive(input){var val,valueOf,toString;if(isPrimitive(input)){return input}valueOf=input.valueOf;if(typeof valueOf==="function"){val=valueOf.call(input);if(isPrimitive(val)){return val}}toString=input.toString;if(typeof toString==="function"){val=toString.call(input);if(isPrimitive(val)){return val}}throw new TypeError}var toObject=function(o){if(o==null){throw new TypeError("can't convert "+o+" to object")}return Object(o)}});

            // minified shim from https://github.com/kriskowal/es5-shim
            (function(definition){if(typeof define=="function"){define(definition)}else if(typeof YUI=="function"){YUI.add("es5-sham",definition)}else{definition()}})(function(){var call=Function.prototype.call;var prototypeOfObject=Object.prototype;var owns=call.bind(prototypeOfObject.hasOwnProperty);var defineGetter;var defineSetter;var lookupGetter;var lookupSetter;var supportsAccessors;if(supportsAccessors=owns(prototypeOfObject,"__defineGetter__")){defineGetter=call.bind(prototypeOfObject.__defineGetter__);defineSetter=call.bind(prototypeOfObject.__defineSetter__);lookupGetter=call.bind(prototypeOfObject.__lookupGetter__);lookupSetter=call.bind(prototypeOfObject.__lookupSetter__)}if(!Object.getPrototypeOf){Object.getPrototypeOf=function getPrototypeOf(object){return object.__proto__||(object.constructor?object.constructor.prototype:prototypeOfObject)}}function doesGetOwnPropertyDescriptorWork(object){try{object.sentinel=0;return Object.getOwnPropertyDescriptor(object,"sentinel").value===0}catch(exception){}}if(Object.defineProperty){var getOwnPropertyDescriptorWorksOnObject=doesGetOwnPropertyDescriptorWork({});var getOwnPropertyDescriptorWorksOnDom=typeof document=="undefined"||doesGetOwnPropertyDescriptorWork(document.createElement("div"));if(!getOwnPropertyDescriptorWorksOnDom||!getOwnPropertyDescriptorWorksOnObject){var getOwnPropertyDescriptorFallback=Object.getOwnPropertyDescriptor}}if(!Object.getOwnPropertyDescriptor||getOwnPropertyDescriptorFallback){var ERR_NON_OBJECT="Object.getOwnPropertyDescriptor called on a non-object: ";Object.getOwnPropertyDescriptor=function getOwnPropertyDescriptor(object,property){if(typeof object!="object"&&typeof object!="function"||object===null){throw new TypeError(ERR_NON_OBJECT+object)}if(getOwnPropertyDescriptorFallback){try{return getOwnPropertyDescriptorFallback.call(Object,object,property)}catch(exception){}}if(!owns(object,property)){return}var descriptor={enumerable:true,configurable:true};if(supportsAccessors){var prototype=object.__proto__;object.__proto__=prototypeOfObject;var getter=lookupGetter(object,property);var setter=lookupSetter(object,property);object.__proto__=prototype;if(getter||setter){if(getter){descriptor.get=getter}if(setter){descriptor.set=setter}return descriptor}}descriptor.value=object[property];descriptor.writable=true;return descriptor}}if(!Object.getOwnPropertyNames){Object.getOwnPropertyNames=function getOwnPropertyNames(object){return Object.keys(object)}}if(!Object.create){var createEmpty;var supportsProto=Object.prototype.__proto__===null;if(supportsProto||typeof document=="undefined"){createEmpty=function(){return{__proto__:null}}}else{createEmpty=function(){var iframe=document.createElement("iframe");var parent=document.body||document.documentElement;iframe.style.display="none";parent.appendChild(iframe);iframe.src="javascript:";var empty=iframe.contentWindow.Object.prototype;parent.removeChild(iframe);iframe=null;delete empty.constructor;delete empty.hasOwnProperty;delete empty.propertyIsEnumerable;delete empty.isPrototypeOf;delete empty.toLocaleString;delete empty.toString;delete empty.valueOf;empty.__proto__=null;function Empty(){}Empty.prototype=empty;createEmpty=function(){return new Empty};return new Empty}}Object.create=function create(prototype,properties){var object;function Type(){}if(prototype===null){object=createEmpty()}else{if(typeof prototype!=="object"&&typeof prototype!=="function"){throw new TypeError("Object prototype may only be an Object or null")}Type.prototype=prototype;object=new Type;object.__proto__=prototype}if(properties!==void 0){Object.defineProperties(object,properties)}return object}}function doesDefinePropertyWork(object){try{Object.defineProperty(object,"sentinel",{});return"sentinel"in object}catch(exception){}}if(Object.defineProperty){var definePropertyWorksOnObject=doesDefinePropertyWork({});var definePropertyWorksOnDom=typeof document=="undefined"||doesDefinePropertyWork(document.createElement("div"));if(!definePropertyWorksOnObject||!definePropertyWorksOnDom){var definePropertyFallback=Object.defineProperty,definePropertiesFallback=Object.defineProperties}}if(!Object.defineProperty||definePropertyFallback){var ERR_NON_OBJECT_DESCRIPTOR="Property description must be an object: ";var ERR_NON_OBJECT_TARGET="Object.defineProperty called on non-object: ";var ERR_ACCESSORS_NOT_SUPPORTED="getters & setters can not be defined "+"on this javascript engine";Object.defineProperty=function defineProperty(object,property,descriptor){if(typeof object!="object"&&typeof object!="function"||object===null){throw new TypeError(ERR_NON_OBJECT_TARGET+object)}if(typeof descriptor!="object"&&typeof descriptor!="function"||descriptor===null){throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR+descriptor)}if(definePropertyFallback){try{return definePropertyFallback.call(Object,object,property,descriptor)}catch(exception){}}if(owns(descriptor,"value")){if(supportsAccessors&&(lookupGetter(object,property)||lookupSetter(object,property))){var prototype=object.__proto__;object.__proto__=prototypeOfObject;delete object[property];object[property]=descriptor.value;object.__proto__=prototype}else{object[property]=descriptor.value}}else{if(!supportsAccessors){throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED)}if(owns(descriptor,"get")){defineGetter(object,property,descriptor.get)}if(owns(descriptor,"set")){defineSetter(object,property,descriptor.set)}}return object}}if(!Object.defineProperties||definePropertiesFallback){Object.defineProperties=function defineProperties(object,properties){if(definePropertiesFallback){try{return definePropertiesFallback.call(Object,object,properties)}catch(exception){}}for(var property in properties){if(owns(properties,property)&&property!="__proto__"){Object.defineProperty(object,property,properties[property])}}return object}}if(!Object.seal){Object.seal=function seal(object){return object}}if(!Object.freeze){Object.freeze=function freeze(object){return object}}try{Object.freeze(function(){})}catch(exception){Object.freeze=function freeze(freezeObject){return function freeze(object){if(typeof object=="function"){return object}else{return freezeObject(object)}}}(Object.freeze)}if(!Object.preventExtensions){Object.preventExtensions=function preventExtensions(object){return object}}if(!Object.isSealed){Object.isSealed=function isSealed(object){return false}}if(!Object.isFrozen){Object.isFrozen=function isFrozen(object){return false}}if(!Object.isExtensible){Object.isExtensible=function isExtensible(object){if(Object(object)!==object){throw new TypeError}var name="";while(owns(object,name)){name+="?"}object[name]=true;var returnValue=owns(object,name);delete object[name];return returnValue}}});
        },

        deployISODatePolyFill: function(){
            // minified shim from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
            if(!Date.prototype.toISOString){(function(){function e(e){if(e<10){return"0"+e}return e}Date.prototype.toISOString=function(){return this.getUTCFullYear()+"-"+e(this.getUTCMonth()+1)+"-"+e(this.getUTCDate())+"T"+e(this.getUTCHours())+":"+e(this.getUTCMinutes())+":"+e(this.getUTCSeconds())+"."+(this.getUTCMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"}})()}
        }
    };

    /**
     * Public API definition
     */
    var Wix = {
        // helper function to name the Wix object on runtime
        /**
         * @private
         * @constructor
         */
        constructor: function Wix(){},

        /**
         * Supported events - some are relevant for the editor only
         */
        Events:{
            /**
             * @since SDK 1.11.0
             * Signal transition between editor and preview modes
             */
            EDIT_MODE_CHANGE:'EDIT_MODE_CHANGE',
            /**
             * @since SDK 1.11.0
             * @deprecated
             * Signal page navigation, relevant for editor, preview & site
             */
            PAGE_NAVIGATION_CHANGE:'PAGE_NAVIGATION_CHANGE',
            /**
             * @since SDK 1.13.0
             * Signal Site publishing - editor only
             */
            SITE_PUBLISHED: 'SITE_PUBLISHED',
            /**
             * @since SDK 1.13.0
             * Signal Component deletion in the editor
             */
            COMPONENT_DELETED: 'COMPONENT_DELETED',
            /**
             * @since SDK 1.17.0
             * Signal internal app message
             */
            SETTINGS_UPDATED: 'SETTINGS_UPDATED',
            /**
             * @since SDK 1.18.0
             * Signal window placement change
             */
            WINDOW_PLACEMENT_CHANGED: 'WINDOW_PLACEMENT_CHANGED',
            /**
             * @private
             */
            ON_MESSAGE_RESPONSE: "ON_MESSAGE_RESPONSE",
            /**
             * @since SDK 1.22.0
             *
             */
            THEME_CHANGE: 'THEME_CHANGE',
            /**
             * @since SDK 1.22.0
             *
             */
            STYLE_PARAMS_CHANGE: 'STYLE_PARAMS_CHANGE',
			/**
			 * @since SDK 1.25.0
			 *
			 */
            SCROLL: 'SCROLL',
            PAGE_NAVIGATION: 'PAGE_NAVIGATION',
            PAGE_NAVIGATION_IN: 'PAGE_NAVIGATION_IN',
            PAGE_NAVIGATION_OUT: 'PAGE_NAVIGATION_OUT'
        },

        Error: {
            WIX_ERROR: 'WIX_ERROR',
            NOT_FOUND: 'NOT_FOUND',
            BAD_REQUEST: 'BAD_REQUEST',
            INVALID_SCHEMA: 'INVALID_SCHEMA'
        },

        /**
         * Enum Window Origin
         *
         * Represents a Wix popup window origin. A window can be positioned where it is origin is the viewport (0,0) or
         * where the origin is another widget (x,y).
         */
        WindowOrigin: {
            DEFAULT: 'FIXED',
            FIXED: 'FIXED',
            RELATIVE: 'RELATIVE',
            ABSOLUTE: 'ABSOLUTE'
        },

        /**
         * Enum Window placement
         *
         * Represents a predefined values to position a Wix popup windows without the hassle of figuring out the position yourself.
         * Can be used to position the window relatively (to the calling widget) or absolutely (to the viewport).
         */
        WindowPlacement: {
            /* corner positions - clock wise */
            TOP_LEFT: 'TOP_LEFT',
            TOP_RIGHT: 'TOP_RIGHT',
            BOTTOM_RIGHT: 'BOTTOM_RIGHT',
            BOTTOM_LEFT: 'BOTTOM_LEFT',
            /* edge center positions - clock wise */
            TOP_CENTER: 'TOP_CENTER',
            CENTER_RIGHT: 'CENTER_RIGHT',
            BOTTOM_CENTER: 'BOTTOM_CENTER',
            CENTER_LEFT: 'CENTER_LEFT',
            CENTER: 'CENTER'
        },

		/**
		 * Enum Theme
		 *
		 * A theme for a popup window
		 */
		Theme: {
			DEFAULT:'DEFAULT',
			BARE:'BARE'
		}
    };

    Wix.PostMessageDispatcher = (function(){
        return {
            sendMessage: function(type, args, callback){
                _w.sendMessageInternal2(type, args, callback);
            }
        }
    }());


    function extend(target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] === 'object') {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    //initialize activities and deploy Wix.Activities
    container.Wix.Activities.init(_w, Wix.PostMessageDispatcher, container.Wix.ResponseHandlers);
    Wix.Activities = container.Wix.Activities;

    //deploy Wix.WixDataCursor
    Wix.WixDataCursor = container.Wix.WixDataCursor;

    //deploy Wix.Dashboard
    Wix.Dashboard = container.Wix.Dashboard;

    //initialize contacts and deploy Wix.Contacts
    container.Wix.Contacts.init(_w, Wix.PostMessageDispatcher, container.Wix.ResponseHandlers);
    Wix.Contacts = container.Wix.Contacts;

    //initialize pubSub and deploy Wix.PubSub
    container.Wix.PubSub.init(_w, Wix.PostMessageDispatcher);
    Wix.PubSub = container.Wix.PubSub;

    container.Wix.ResponseHandlers.init(_w, Wix.PostMessageDispatcher);
    Wix._handlers = container.Wix.ResponseHandlers;

    //deploy base APIs on Wix
    extend(Wix, container.Wix.BaseAPI);

    //initialize Styles APIs
    container.Wix.Styles.init(_w);
    Wix.Styles = container.Wix.Styles;

    //initialize Settings APIs
    container.Wix.Settings.init(_w);
    Wix.Settings = container.Wix.Settings;

    //initialize Utils APIs
    container.Wix.Utils.init(_w);
    Wix.Utils = container.Wix.Utils;

    //initialize base APIs
    container.Wix.BaseAPI.init(_w, Wix.PostMessageDispatcher, Wix.Utils);
    Wix.__baseAPI = container.Wix.BaseAPI;

    //Deploy API on the container (iframe window)
    container.Wix = Wix;

	_w.init();
})(this);
