/**
 * @namespace
 * @description This package provides debugging and profiling tools.  The primary purpose is to provide a means for 
 * controlling console output globally and within closures as required.  An optional output window is provided as well.  
 * This is helpful for devices without a console window or when you do not require the full feature set of the native
 * browser consoles.  Finally a handy profiler for profiling javascript code execution and individual components.
 * All that utility at just 0.309kb minified in a production environment and under 12kb minified in development.
 *
 * An instance of the Debugger called `iDebugger` and the global debug method called `debug` are available after loading 
 * iDebugConsole.js.  Use the debug method exactly how you would use console except that debug() may be called directly 
 * as a shortcut to `debug.log()`. Each Debugger instance provide independent control over the closure it is assigned to.
 *
 * @author Simplex Studio, LTD
 * @copyright Copyright (c) 2016 Simplex Studio, LTD
 * @license The MIT License (MIT)
 * Copyright (c) 2016 Simplex Studio, LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var iDebugConsole = function() {

    /**
	 * @memberof iDebugConsole
     * @class Debugger is the class responsible for controlling weather a debug statement is ignored, output to the
     * browser console or iDebugConsole.  Debug output is disabled by default, enable output by setting window.iDebugMode
     * = true/false prior to loading iDebugConsole.js.  This is especially useful when used with a back end framework such
     * as django which supplies it's own debug flag.  To toggle the global debug flag use the global method of any
     * Debugger instance or Debugger.prototype.
     *
     * @example <caption>Enable debug output before loading.</caption>
     *  <script language="javascript">window.iDebugMode=true</script>
     *  <script src="js/iDebugConsole.js""></script>
     *
     * @example <caption>Enable debug output after loading.</caption>
     *  <script src="js/iDebugConsole.js""></script>
     *  <script language="javascript">
     *
     *      this.debug('This will not be output to the console')
     *
     *      // Turn on global debugging
     *      iDebugger.global(true)
     *
     *      // Global debugging my be controlled via the Debugger prototype as well
     *      Debugger.prototype.global(true)
     *
     *      this.debug('This will be output to the console')
     *      this.debug.warn('It supports all valid console methods')
     * </script>
     *
     * The iDebugConsole window is disabled by default, output will be directed only to the native console window.
     * Although the iDebugConsole window has a vary small feature set compared to the native console there are a few
     * distinct advantages:
     * - It's faster.
     * - Embedded in your website on load.
     * - Each debug statement contains a stack trace.
     * - It does not reduce your device window size.
     * - It can be initialized in open or closed mode.
     * - It scales it's self to the device screen size.
     * - It can be dragged, resized, docked, or full screen on demand.
     *
     * @example <caption>Enable iDebugConsole output window.</caption>
     *  <script language="javascript">
     *      // Enable the on screen output in closed mode (minimized).
     *      iDebugger.initView('closed')
     *      // Enable the on screen output window via the Debugger prototype
     *      Debugger.prototype.initView('open')
     *  </script>
     *
     * Note:: When using the iDebugConsole output window, the output will also appear in the native browser console window,
     * but the location data will show a Debugger location. Corrected location data will be injected into each debug statement.
     *
     * @example <caption>Use django to set the global debug state</caption>
     * 1) In your django settings file TEMPLATE_CONTEXT_PROCESSORS must contain the debug context processor:
     *   'django.core.context_processors.debug' (django < 1.8) or
     *   'django.template.context_processors.debug' (django >= 1.8)
     * 2) Make sure you have defined the setting INTERNAL_IPS = ('127.0.0.1',) add ip addresses as required.
     * 3) In your HTML template file use the {{debug}} variable supplied by django's debug context processor
     *    to set window.iDebugMode and load iDebugConsole.
     *    {% if debug %}
     *       <script language="javascript">window.iDebugMode=true</script>
     *    {% endif %}
     *    <script src="{% static "js/iDebugConsole.js" %}"></script>
     *
     * @example <caption>Minimize iDebugConsole's footprint in production:</caption>
     *    {% if debug %}
     *       <script language="javascript">window.iDebugMode=true</script>
     *       <script src="{% static "js/iDebugConsole.js" %}"></script>
     *    {% else %}
     *      <script src="{% static "js/iDebugDummy.js" %}"></script>
     *    {% endif %}
     *
     *    NOTE:: Alternatively just copy the contents of iDebugDummy.js and paste into the top of your javascript.
     *
     * @description 
	 * Add this class to any closure to provide control over the console output of debug data witin that closure. 
	 * All objects specified will have a debug() method created automagically.
     *
     * @param   {object}    objects         - Specify included objects as {key:object} pairs.
     * @param   {boolean}   [state=false]   - Initial debug output state for all objects true=on false=off.
     *
     * @example <caption>Instantiate a Debugger within a class for class level control.</caption>
     * function MyClass (){
     *     var ctrl = new Controller
     *     var model = new Model(ctrl)
     *     var view = new View(ctrl, model)
     *     this.iDebug = new iDebugConsole.Debugger({model:model, view:view, ctrl:ctrl}, true)
     *
     *     // use the debugger like this
     *     this.debug('This is the same as calling console.log()')
     * }
     *
     * @example <caption>Dynamically toggle debugging only for a specified closure.</caption>
     * var myClass = new MyClass()
     *
     * //turn off the MyClass debugger
     * myClass.iDebug.off()
     *
     * //turn off the MyClass.model debugger only
     * myClass.iDebug.off('model')
     */
    function Debugger(objects, state) {
        //TODO: auto recognise model, view, ctrl from self object
        /**
         * The objects to debug as {key:value} pairs.  The key should
         * be a string used to refer to the object
         * @type {Object}
         * @private
         */
        this._objects = objects;

        // init debugger
        this.init(state);
    }
    Debugger.prototype = function () {

        // Class variables & methods

        //Tracks all debugger objects for global control.
        var allDebuggers = []
        //Tracks the global debug state.
        var globalDebug = window.iDebugMode !== undefined ? window.iDebugMode : false
        //The console view.
        var view = false

        /**
         * Sets and gets the global debug state.
         * @param state {boolean} - Toggle the global debug state.
         * @memberof Debugger
         */
        var global = function (state) {
            if (state)
                globalDebug = state
            else
                return globalDebug
        }

        // Instance methods

        /**
         * Initialize debugger for all included objects.  Adds this._debug,
         * this.debug(), this.debug.log(), this.debug.info(), this.debug.warn(),
         * and this.debug.error() to each included object with it's own context.
         * @param state {boolean} - Initial debug state for all objects.
         * @memberof Debugger
         * @private
         */
        function init(state) {
            if (!state && state !== false) console.log('You have not supplied a debug state for', this._objects)
            setState.call(this, state);

            for (var key in this._objects) {
                var obj = this._objects[key]
                allDebuggers.push(obj)
                obj.debug = debug.call(obj);
                for (var f in console)
                    if (typeof console[f] == 'function')
                        obj.debug[f] = debug.call(obj, f);
            }
        }

        /**
         * Initialize the console view.
         * @param state
         * @param options
         * @memberof Debugger
         */
        function initView(state, options) {
            view = new DebuggerView(state, options)
        }

        /**
         * Turns off debugging for specified object or all abjects if no object key is specified.
         * @param {string} [key] - Name given to object in objects perameter {@link Debugger~objects}.
         * @returns {Debugger.state}
         * @example <caption>Turn off debug output</caption>
         * // Sets all included objects this._debug = false
         * myClass.debugger.off();
         * // Sets myClass.model._debug = false
         * myClass.debugger.off("model");
         * @memberof Debugger
         */
        function off(key) {
            return setState.call(this, false, key);
        }

        /**
         * Turns on debugging for specified object or all abjects if no object key is specified.
         * @param {string} [key] - Name given to object in objects perameter {@link Debugger~objects}.
         * @returns {Debugger.state}
         * @example <caption>Turn on debug output</caption>
         * // Sets all included objects this._debug = true
         * myClass.debugger.on();
         * // Sets myClass.model._debug = true
         * myClass.debugger.on("model");
         * @memberof Debugger
         */
        function on(key) {
            return setState.call(this, true, key);
        }

        /**
         * Sets the debug state for the specified object or all abjects if no object key is
         * specified.  Each objects state is stored in it's own property (this._debug = state).
         * This property will be created automatically.
         * @param {boolean} state - Determines if debug output is on(true) or off(false).
         * @param {string} [key] - Name given to object in objects perameter {@link Debugger~objects}.
         * @returns {Debugger.state}
         * @memberof Debugger
         * @private
         */
        function setState(state, key) {
            if (key)
                this._objects[key]._debug = state;
            else {
                for (var k in this._objects) {
                    // create private var for each object
                    this._objects[k]._debug = state;
                }
            }
            return this.state();
        }

        /**
         * Calls console at the specified level if debug is on.  Avalable for each object
         * supplied to {@link Debuggger.init} as this.debug().  You may also call as this.debug.log(),
         * this.debug.info(), this.debug.warn(), this.debug.error().
         * @param {string} [level="log"] - Determines console output level
         * @returns {function}
         * @memberof Debugger
         * @private
         */
        function debug(level) {
            level = level || "log"
            if (!globalDebug || !this._debug)
                return function () {};
            if (view)
                return view.output.bind(this, level)
            return console[level].bind(window.console, arguments)
        }

        /**
         * Returns the debug state of all included objects as an object.
         * @example {"view":"off", "model":"on", "ctrl":"on"}
         * @returns {Object.<key,state>}
         * @memberof Debugger
         * @private
         */
        function state() {
            var result = {}
            for (var k in this._objects) {
                result[k] = this._objects[k]._debug ? 'on' : 'off';
            }
            return result
        }

        return {
            init: init,
            state: state,
            off: off,
            on: on,
            global: global,
            initView: initView
        }
    }();


    /**
	 * @memberof iDebugConsole
     * @class The on screen output window component of iDebugConsole.
     * @param state {string|options}        Accepts a string equivalent to a valid option.state or an options object.
     * @param options {object}              The following options are available:
     * @param options.state {string}        Initial state of the iDebugConsole ("open" or "closed")
     * @param options.test {string|re}      Test for a specific userAgent before init. There is a string shortcut
     *                                      to test for iOS devices "ios".
     * @constructor
     */
    var DebuggerView = function (state, options) {
        this.init(state, options)
    }
    DebuggerView.prototype = function () {
        // Start Output Window code

        // Output window class properties

        // Output window initial settings
        var initOpenW = '70%'
        var initOpenH = '50%'
        var closedSize = '36px'

        var scrollMode = false         // init with scroll mode off
        var onScreen = null          // the view is initialized
        var autoScroll = true          // automatically scroll when line added
        var scrollHt = undefined     // scroll mode height
        var scrollWd = undefined     // scroll mode width
        var passiveHt = undefined     // passive mode height
        var passiveWd = undefined     // passive mode widtht

        var d = document
        var b = document.documentElement || document.body
        var eCont = null          // The onscreen debugger container
        var eOpCont = null          // controlls scroll position of output
        var eOutput = null          // holds the output lines
        var eOptions = null          // holds the options buttons
        var drs = null          // enables drag, resize, snap ability

        // Output window buttons
        var bClose, bClear, bScroll, bScrollUp, bScrollDn, bAutoScroll, bDrag,
            bHelp, bSize, bTogLoc

        var iOpen = "&#10016"
        var iClear = "&#8802"
        var iScroll = "&#8645;"
        var iDrag = "&#10019;"
        var iAutoScroll = "&#8794;"
        var iSize = "&#8622;"
        var iHelp = "&#9764;"
        var iScrlUp = "&#9650;"
        var iScrlDn = "&#9660;"
        var iTogLoc = "&#x00040;"
        var iLoc = "&#x00040;"
        var iStack = "&#8801;"


        // Output window class methods

        var createView = function () {
            // elements
            eCont = createEle("div", document.body, "#debug-cont")
            eCont.style.width = initOpenW
            eCont.style.minWidth = closedSize
            eCont.style.height = initOpenH
            close() // sets the initial state open / close
            eOpCont = createEle("div", eCont, ".op-cont")
            eOutput = createEle("ol", eOpCont, ".output")
            eOptions = createEle("div", eCont, ".options")
            // buttons
            bClose = createEle("div", eOptions, ".btn .btn-close " + iOpen)
            bClear = createEle("div", eOptions, ".btn .btn-clear " + iClear)
            bClear.style.fontSize = "1.2em"
            bClear.style.marginTop = "-4px"
            bScroll = createEle("div", eOptions, ".btn .btn-scroll " + iScroll)
            bDrag = createEle("div", eOptions, ".btn .btn-drag " + iDrag)
            bDrag.style.cursor = "move"
            bScrollUp = createEle("div", eOptions, ".btn .btn-scroll-up " + iScrlUp)
            bScrollUp.style.display = "none"
            bScrollDn = createEle("div", eOptions, ".btn .btn-scroll-dn " + iScrlDn)
            bScrollDn.style.display = "none"
            bAutoScroll = createEle("div", eOptions, ".btn .btn-autoscroll " + iAutoScroll)
            bAutoScroll.style.display = "none"
            bSize = createEle("div", eOptions, ".btn .btn-size " + iSize)
            bSize.style.fontSize = "1.2em"
            bTogLoc = createEle("div", eOptions, ".btn .btn-tog-loc " + iTogLoc)
            bTogLoc.style.fontSize = ".8em"
            //bTogLoc.style.verticalAlign = "middle"
            bHelp = createEle("div", eOptions, ".btn .btn-help " + iHelp)
        }

        var clearView = function (html) {
            eOutput.innerHTML = html || ''
        }

        var open = function (size) {
            size = size || initOpenW
            eCont.style.width = size
            eCont.style.minWidth = ''
            eCont.style.maxWidth = ''
            eCont.style.whiteSpace = ""
        }

        var close = function () {
            eCont.style.width = closedSize
            eCont.style.minWidth = closedSize
            eCont.style.maxWidth = closedSize
            eCont.style.whiteSpace = "nowrap"
        }

        var toggleScrollMode = function (state, resize) {
            scrollMode = state || !scrollMode
            resize = resize === undefined ? true : resize
            if (scrollMode) {
                addClass(eCont, 'scroll')
                if (!resize) return
                passiveHt = eCont.style.height
                passiveWd = eCont.style.width
                if (scrollHt)
                    eCont.style.height = scrollHt
                if (scrollWd)
                    eCont.style.width = scrollWd
                if (autoScroll)
                    eOpCont.scrollTop = eOpCont.scrollHeight
            }
            else {
                removeClass(eCont, 'scroll')
                if (!resize) return
                scrollHt = eCont.style.height
                scrollWd = eCont.style.width
                if (passiveHt)
                    eCont.style.height = passiveHt
                if (passiveWd)
                    eCont.style.width = passiveWd
            }

            // show / hide scroll group buttons
            var scrollGroup = [
                eOptions.getElementsByClassName("btn-autoscroll")[0],
                eOptions.getElementsByClassName("btn-scroll-up")[0],
                eOptions.getElementsByClassName("btn-scroll-dn")[0],
            ]

            if (scrollMode) {
                for (var b in scrollGroup)
                    scrollGroup[b].style.display = "inline-block"
            }
            else {
                for (var b in scrollGroup)
                    scrollGroup[b].style.display = "none"
            }
        }


        /**
         * Initializes the iDebugConsole, responsible for processing the state and options.
         * @private
         */
        var init = function (state, options) {
            var globalDebug = Debugger.prototype.global()
            // prevent view from init twice
            if (onScreen || !globalDebug)  return

            options = options || {}
            if (typeof state == 'object')
                options = state
            else
                options.state = state

            if (options.test == 'ios')
                options.test = /iPhone|iPod|iPad/i

            console.log('TEST navigator', options.test)
            if (options.test)
                if (!options.test.test(navigator.userAgent))
                    return

            createView()

            noDTZoom(eCont) // prevent double tap zoom on ios

            // button events
            eOptions.addEventListener("click", function (e) {
                e.preventDefault()

                // disable buttons in help mode
                if (!isClicked(e, 'btn-help') && hasClass(bHelp, 'active'))
                    return
                // close
                if (hasClass(e.target, 'btn-close')) {
                    scrollMode = hasClass(eCont, 'scroll')
                    var width = eCont.getBoundingClientRect().width
                    if (width <= parseInt(closedSize + 5))
                        open(scrollMode ? scrollWd || initOpenW : passiveWd || initOpenW)
                    else
                        close()
                }
                // toggle scroll mode
                else if (hasClass(e.target, 'btn-scroll')) {
                    toggleScrollMode()
                }
                // scroll up
                else if (hasClass(e.target, 'btn-scroll-up')) {
                    eOpCont.scrollTop = eOpCont.scrollTop - eOpCont.offsetHeight
                }
                // scroll-dn
                else if (hasClass(e.target, 'btn-scroll-dn')) {
                    eOpCont.scrollTop = eOpCont.scrollTop + eOpCont.offsetHeight
                }
                // autoscroll
                else if (hasClass(e.target, 'btn-autoscroll')) {
                    autoScroll = !toggleClass(e.target, 'off')
                    if (autoScroll)
                        eOpCont.scrollTop = eOpCont.scrollHeight
                }
                // clear
                else if (hasClass(e.target, 'btn-clear')) {
                    clearView('The log has been cleared!')
                }
                // dock
                else if (hasClass(e.target, 'btn-dock-lr')) {
                    var debugCont = getParent(e.target.parentElement, 'debug-cont')
                    var ww = window.innerWidth - debugCont.offsetWidth
                    var rt = parseInt(debugCont.style.right)

                    rt = isNaN(rt) ? 0 : rt

                    if (rt === ww || rt > ww / 2) {
                        debugCont.style.right = 0
                    } else if (rt === 0 || rt < ww / 2) {
                        debugCont.style.right = ww + "px"
                    }

                }
                // help
                else if (isClicked(e, 'btn-help')) {
                    var state = toggleClass(bHelp, 'active')
                    if (state) {
                        drs.snapFullScreen()
                        toggleScrollMode(true, false)
                        bHelp.innerHTML += '<span style="font-size:10px;">Exit Help</span>'
                    } else {
                        drs.restorePreSnap()
                        toggleScrollMode(false, false)
                        var exit = bHelp.getElementsByTagName('span')[0];
                        bHelp.removeChild(exit);
                    }

                    clearView(
                        '<li><b>OUTPUT LINE BUTTONS:</b></li>' +
                        '<ul>' + 'Each output line has the following buttons:' +
                        '<li>' + iStack + ' <b>Stack:</b> Shows the full stack trace.</li>' +
                        '<li>' + iLoc + ' <b>Location:</b> Show the location (file:line:col).</li>' +
                        '</ul>' +
                        '<li><b>WINDOW SIZE AND POSITION:</b></li>' +
                        '<ul>' +
                        '<li>' + iOpen + ' <b>Close/Open:</b> Toggle window open and closed.</li>' +
                        '<li>' + iDrag + '<b> Move:</b> Press and drag to move window. The shaded ' +
                        'line number area will also allow move.</li>' +
                        '<li>' + iSize + ' Toggle Bounds: Make bounds fixed or a percentage of the browser window ' +
                        '(size changes as window size changes).</li>' +
                        '<li><b>Resize:</b> Press and drag any edge to resize window, corder will ' +
                        'double resize.</li>' +
                        '<li><b>Snap:</b> Drag just past a screen edge to snap.</li>' +
                        '<li><b>FullScreen:</b> Drag 100px or more past an edge to go full screen.</li>' +
                        '<li><b>Unsnap:</b> Drag in any direction away from edge for unsnap and resize to pre-snap dimentions ' +
                        'or Click the drag button for unsnap and retain snapped size.' +
                        '<li><b>Center:</b> Tripple tap anywhere to center on the screen.</li>' +
                        '</ul>' +
                        '<li><b>WINDOW SCROLL / WINDOW GHOST:</b></li>' +
                        '<ul>' +
                        '<li>' + iScroll + ' <b>Toggle Ghost/Scroll:</b> Ghost mode will pass all mouse and ' +
                        'touch events to obscured items.  Scroll mode allows for scrolling up and ' +
                        'down, but will block touch and mouse events from obscured items.<br>' +
                        'Note: Scroll mode and ghost mode will remember thier respective sizes!</li>' +
                        '<li>' + iScrlUp + ' <b>Scroll Up:</b> One full page (only in scroll mode).</li>' +
                        '<li>' + iScrlDn + ' <b>Scroll Down:</b> One full page (only in scroll mode).</li>' +
                        '<li>' + iAutoScroll + ' <b>Auto Scroll:</b> Scroll to the last line as they come.</li>' +
                        '</ul>' +
                        '<li><b>OTHER BUTTONS:</b></li>' +
                        '<ul>' +
                        '<li>' + iClear + ' <b>Clear:</b> Clears the contents of the ouput window.</li>' +
                        '<li>' + iTogLoc + ' Toggle location: Toggle location for all lines.' +
                        ' changes as window size changes).</li>' +
                        '<li>' + iHelp + ' <b>Help:</b> You are here.</li>' +
                        '</ul>' +
                        '<li><b>CSS:</b></li>' +
                        '<ul>' +
                        '<li>Style colors and whatnot with css.' +
                        '</ul>'
                    )

                }
                // clear
                else if (hasClass(e.target, 'btn-size')) {
                    var state = toggleClass(e.target, 'off')
                    drs.togglePercent(!state)
                }
                else if (hasClass(e.target, 'btn-tog-loc')) {
                    var locs = d.getElementsByClassName('loc')
                    toggleClass(locs, 'hide')
                }
            })

            // line item events
            eOutput.addEventListener("click", function (e) {
                var li = getParent(e.target.parentElement, 'li')
                if (li) {
                    // show location
                    if (hasClass(e.target, "btn-location")) {
                        toggleClass(li.getElementsByClassName("loc"), "hide")
                    }
                    // show stack
                    if (hasClass(e.target, "btn-stack")) {
                        if (!scrollMode) toggleScrollMode()
                        toggleClass(li.getElementsByClassName("stack"), "hide")
                    }
                }
            })

            // catch real errors and print to screen
            window.onerror = function (message, url, line) {
                var m = makeOutput.call(this, ['error', message], {url: url, line: line}, true)
                printToScreen.call(this, m)
                return false;
            }.bind(this);

            makeTouchScroll(eOpCont)

            // enable drag resize zoom
            drs = core.util.DRS.makeDRS(eCont, [bDrag, {left: 0, bottom: 28, top: 0, width: 28}])
            drs.togglePercent(true) // start in percent mode

            // Call the apropriate state method
            if (options.state) this[options.state].call(this)

            // finally set view status
            onScreen = true
        }

        // adds touch scrolling to a scrollable element
        function makeTouchScroll(ele) {

            var prevY, difY, scrollFrame

            ele.addEventListener("touchstart", function (e) {
                if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
                var touch = e.touches[0]
                prevY = touch.clientY
                difY = null // stop scrolling
                console.log(e.target)
            })

            ele.addEventListener("touchmove", function (e) {
                e.preventDefault()
                e.stopPropagation()
                var touch = e.changedTouches[0]
                difY = touch.clientY - prevY
                ele.scrollTop = ele.scrollTop + difY * -1
                prevY = touch.clientY
            })

            document.addEventListener("touchend", function (e) {
                prevY = null
                if (difY)
                    scrollFrame = requestAnimationFrame(dynamicScroll);
            })

            function dynamicScroll() {
                if ((difY > 1 || difY < -1)) {
                    ele.scrollTop = ele.scrollTop + difY * -1
                    difY = difY * .92
                    scrollFrame = requestAnimationFrame(dynamicScroll);
                } else {
                    ele.scrollTop = ele.scrollTop + difY * -1
                }
            }
        }

        // end on screen output window code

        /**
         * Writes debug message to debug window and console when using screen output.
         * @param args  {arguments} - The arguments from previous function
         * @param loc  {Location} - Determines console output level
         * @returns {string}
         * @private
         */
        function output(level) {

            var args = Array.prototype.slice.call(arguments, 0)

            var m = makeOutput(args)

            printToScreen(m)

            // this will write to console
            try {
                // TODO: optimize for ie, firefox, opra
                // determine console width in characters and add spaces to justify right
                var spaceStr = ""
                var extraWidth = 170       //scroll bar and anything else ie: browser line numbers
                var consoleCharWidth = 7   // the width of console charicters in pixels
                var consoleW = (window.outerWidth - window.innerWidth - extraWidth)
                consoleW = consoleW > 10 ? consoleW : window.innerWidth
                var filler = (consoleW / consoleCharWidth) - (m.message.length + m.loc.length)
                while (spaceStr.length < filler) {
                    spaceStr += " "
                }
                // apply to console
                console[level].apply(window.console, args.concat([spaceStr + m.loc.loc]))
            } catch (e) {
                output('error', '"' + level + '"' + ' is not a supported console function.')
            }
        }

        /**
         * Prints debug message to screen
         * @param outputObject  {object} - The output project ot print
         * @returns {string}
         * @private
         */
        function printToScreen(outputObject) {
            var m = outputObject
            // create li element and append
            var e = createEle("li", eOutput, "." + m.level)
            e.className = m.level
            var eM = createEle("div", e, ".message")
            var eLevel = createEle("i", eM, ".level")
            eLevel.innerHTML = m.level + " "
            var eSB = createEle("i", eM, ".btn-stack " + iStack + " ")
            eSB.style.fontSize = "1.1em"
            //eSB.style.verticalAlign= "middle"
            var eLB = createEle("i", eM, ".btn-location " + iLoc)
            eLB.style.fontSize = ".8em"
            eLB.style.verticalAlign = "middle"
            var eLoc = createEle("span", eM, ".loc .hide")
            eLoc.innerHTML = m.loc + " "
            var eText = createEle("span", eM, ": " + m.message)
            var eStack = createEle("div", e, ".stack .hide")
            eStack.innerHTML = m.stack

            // auto scroll to bottom
            if (autoScroll)
                eOpCont.scrollTop = eOpCont.scrollHeight
        }

        /**
         * Creates an output object.
         * @param args  {Array} First arg must be level, all other args are converted to message text.
         * @param loc {Object} Any valid LogLocation options to use.
         * @param noescape {bool} HTML Escape message
         * @returns {{level: string, message: string, stack: string, loc: LogLocation}}
         * @private
         */
        function makeOutput(args, loc, noescape) {
            var level = args.shift()
            var message = ''
            var stack = ''
            loc = new LogLocation(loc)

            // prepare message
            for (var i in args)
                message += args[i] + " "
            if (!noescape)
                message = escapeHtml(message)

            // prepare stack
            for (var s in loc.stack)
                stack += "--> " + loc.stack[s] + "<br>"

            return {level: level, message: message, stack: stack, loc: loc}
        }

        return {
            init: init,
            open: open,
            close: close,
            output: output
        }


    }()

    /**
	 * @memberof iDebugConsole
     * @class Obtains the original location for a debug statement when intercepted for screen output.
     * @param options {object}
     * @param options.url {string}      - Use when the debug url known.
     * @param options.line {string}     - Use when the debug line is known.
     * @param options.offset {integer}  - offset the baseIndex (determines where to slice a constructed stack)
     * @constructor
     * @private
     */
    var LogLocation = function (options) {
        options = options !== undefined ? options : {}
        this.stack = []
        this.url = options.url
        this.loc = ''
        this.path = ''
        this.file = ''
        this.line = options.line
        this.col = ''
        this.str = ''

        try {
            var e = new Error()
            throw e
        } catch (error) {
            e = error
        }

        this.init(e, options.offset)
    }
    LogLocation.prototype = function () {
        var baseIndex = 4

        function init(e, offset) {
            this.stack = getStack(e, offset)
            this.url = this.url || e.url || this.stack[0] || "?"
            var loc = locFromUrl(this.url)
            this.path = loc.path
            this.file = loc.file || "?"
            this.line = this.line || loc.line || e.line || e.lineNumber || "?"
            this.col = loc.col || e.column || ""
            var str = [this.file, this.line, this.col].join(':')
            this.str = this.loc = "(" + str + ")"
        }

        function toString() {
            return this.str
        }

        function getStack(e, offset) {
            var index = baseIndex + (offset || 0)
            var stackS = e.stack || ""
            var stackA = stackS.split('\n') || []
            // remove internal
            stackA = stackA.slice(index)
            // create stackA if not available
            if (!(stackA.length && stackA[0])) {
                var currentFunction = arguments.callee;
                while (currentFunction) {
                    var fn = currentFunction.toString();
                    var fname = fn.match(/function\s(\w+?)\s*\(/) || ["", "anonymous"];
                    stackA.push(fname[1]);
                    currentFunction = currentFunction.callee;
                }
                // remove internal
                stackA = stackA.slice(index - 2)
            }
            return stackA
        }

        function locFromUrl(url) {
            var parts = url.split('/') || []

            var loc = parts.pop().replace(')', '')
                .replace('(', '')
            var path = parts.join("/")
            var locL = loc.split(':') || []
            return {
                line: locL[1],
                col: locL[2],
                file: locL[0],
                path: path
            }
        }

        return {init: init, toString: toString}
    }()

    /**
     * Constructs a Profiler instance.
     * @class Use as a decorator to profile a function or as a stopwatch to time any portion of code.
     * @constructor
     * @param objectToTime {object}                     - First param is the object to time.
     * @param name {string|options}                     - Second param takes options.name as a string
     *                                                  or an options object.
     * @param options {object}                          - Instantiation options
     * @param options.name {bool} [objectToTime.name]   - A custom name for profiler output.
     * @param options.performance {bool} [true]         - Source of time, true:window.performance
     *                                                  or false:Date().getTime()
     * @param options.group {string} ["profileSite"]    - Group name, All instances in a group are
     *                                                  toggled active/inactive together
     * @param options.active {object} [true]            - Active / inactive state, overrides group state for one instance
     *
     *
     * @example <caption>Profile a function:</caption>
     * // You can instantiate the Profiler anyplace within the function's scope.
     * // The syntax must be in the form: functionName = new Profiler(functionName);
     * functionA = new Profiler(functionA);
     * function functionA(){
     *     //All this code will be profiled
     * }
     * // Note: functionA.profile will contain the Profiler instance.
     *
     * example <caption>Profile a function expression:</caption>
     * // Profiler must instantiated be after the function expression.
     * var MyCalss = functionA(){
     *     // The class constructor will be profiled
     * }
     * MyClass = new Profiler(MyClass);
     * MyClass.prototype.myMethod = function(){}
     *
     * @example <caption>Toggle all profilers on or off:</caption>
     * // A the top of your file set the global group to true (on) or false (off)
     * // Setting global = off will disable all custom groups as well.
     * Profiler.groups.global = false
     *
     * @example <caption>How to use custom groups:</caption>
     * // Create a profiler with a custom group
     * functionB = new Profiler(functionB, {group:"profileGroup1"});
     * // You can dynamically change groups at runtime
     * functionB.profile.group("profileGroup2");
     * // You can toggle custom groups the same way we did for "global"
     * Profiler.groups.profileGroup1 = false
     *
     * @example <caption>Create an inactive function Profiler:</caption>
     * var functionC_profile = new Profiler(functionC, {group:"profileGroup1", active:false});
     * // You can dynamically activate at runtime
     * functionB.profile.active(false);
     *
     * @example <caption>Use Profiler as stop watch:</caption>
     * var siteTimer = new Profiler('site wide load timer');
     * siteTimer.start('int first component');
     * // do timed stuff here..
     * siteTimer.start('int second component');
     * // Stop is called automatically when starting a new timed segment
     * siteTimer.stop();
     * // Stopping the timer allows you to do un-timed stuff here..
     * siteTimer.start('int third component');
     * // do more timed stuff here..
     * siteTimer.stop();
     * // Now print the results of the three timed segments
     * siteTimer.printResults();
	 * @memberof iDebugConsole
     */
    var Profiler = function (objectToTime, name, options) {

        // Allow options as second arg
        if (typeof name == 'object')
            options = name
        else if (!options)
            options = {name:name};

        // Allow name as first arg (timer mode)
        if(typeof objectToTime == 'string') {
            options.name = objectToTime
            objectToTime = undefined
        }

        // Option to disable console.table output
        options.table = options.table == undefined ? true : options.table

        // Properties
        this.startTime = 0;
        this.stopTime = 0;
        this.running = false; //clock is running
        this.currentName = options.name
        this.prevName = options.name
        this.initName = options.name
        this._group = 'global'
        this.group(options.group)
        this._active = true
        this.active(options.active);
        this.results = [];
        this.performance = options.performance === false ? false : !!window.performance;
        this.useTable = console.table && options.table && !/MSIE|Edge/i.test(navigator.userAgent)

        return this._initPrototype(objectToTime);

    };
    Profiler.groups = {global:true}
    Profiler.prototype = function () {
        console.info(navigator.userAgent)

        function _initPrototype(objectToTime) {

            var returnObject = this

            if (!this.currentName)
                if(objectToTime)
                    this.currentName = objectToTime.name || objectToTime.prototype.name || objectToTime.toString().slice(0,40).split('{')[0]
                else
                    this.currentName = 'Unnamed timer'

            if(this.currentName.indexOf('function')==0)
                this.currentName = 'unnamed '+ this.currentName

            if (objectToTime)
                if (active.call(this))
                    returnObject = decorate.call(this, objectToTime);
                else
                    returnObject = objectToTime;

            this.prevName = this.currentName
            this.initName = this.currentName

            return returnObject
        }

        //noinspection JSUnusedLocalSymbols
        function toString() {
            return "Timer " + this.currentName;
        }

        function group(overide) {

            if (overide !== undefined) {
                Profiler.groups[overide] = Profiler.groups[overide]==undefined ? true : Profiler.groups[overide]
                if (typeof overide != "string") throw 'Profiler.group must be a global variable as a string.';
                if (Profiler.groups[overide] === undefined)throw 'Profiler.group: Missing a predefined global variable ' +
                'with a boolean value for group "' + overide + '".';
                this._group = overide;
            }
            return this._group
        }

        function active(overide) {
            if (overide !== undefined) {
                if (typeof overide != "boolean") throw "Profiler.active must be a boolean value.";
                this._active = overide;
            }
            return this._active && Profiler.groups[this._group];
        }

        function decorate(objectToTime) {
            var _this = this
            var profileWrapper = function () {
                start.call(_this);
                var retVal = objectToTime.apply(this, arguments);
                //console.log('exicuting wrapper for ('+_this.currentName + ') this: ', this, ' retVal: '+retVal)
                stop.call(_this, 'results');
                return retVal
            };
            profileWrapper.constructor = objectToTime
            profileWrapper.prototype = objectToTime.prototype
            profileWrapper.profiler = this
            return profileWrapper
        }

        function currentTime() {

            return this.performance ? window.performance.now() : new Date().getTime();
        }

        function start(name) {
            if (!active.call(this)) return
            if(this.running) stop.call(this)
            this.currentName = name || this.currentName;
            this.startTime = currentTime();
            this.running = true;
        }

        var stop = function (print) {
            this.stopTime = currentTime();
            this.running = false;
            if (active.call(this)) {
                this.results.push({
                    name:this.currentName,
                    time:this.stopTime - this.startTime});
                if(print == 'elapsed') this.printElapsed();
                else if(print) this.printResults();
            }
        };

        var getElapsedMilliseconds = function () {

            if (this.running) {
                this.stopTime = currentTime();
            }

            return this.stopTime - this.startTime;
        };

        var getElapsedSeconds = function () {

            return getElapsedMilliseconds.call(this) / 1000;
        };

        var printElapsed = function (name) {

            this.currentName = name || this.currentName;
            console.log(this.currentName + ' [Elapsed Time] = ', '[ms:' + getElapsedMilliseconds.call(this) + '] [s: ' + getElapsedSeconds.call(this) + ']');
        };

        var printResults = function (name) {

            this.currentName = name || this.currentName;
            var secTotal = 0;
            var msTotal = 0;
            var count = 0;
            var msDp = 2
            var secDp = 6
            var rows = {}
            var row, sec, msec

            // add results to rows
            for (var i in this.results) {
                count++;
                var result = this.results[i]
                var time = result.time
                var name = result.name

                // Don't use generic names as name
                if(name && name.indexOf('function')==0) name = ''
                else if(name && name.indexOf('Unnamed timer')==0) name = ''
                else if(name == this.prevName) name = ''
                if(name) name = ' '+name

                secTotal += time / 1000;
                msTotal += time;
                msec = time.toFixed(msDp)
                sec = (time / 1000).toFixed(secDp)
                row = {
                    ms:msec,s: sec
                }
                rows[i+name] = row;
                this.prevName = name
            }

            // Add total and average to rows
            var msAverg = (msTotal / count).toFixed(msDp);
            var secAverg = (secTotal / count).toFixed(secDp);
            msTotal = msTotal.toFixed(msDp)
            secTotal = secTotal.toFixed(secDp)
            rows['total'] = {ms:msTotal , s: secTotal};
            rows['avrg'] = {ms:msAverg , s: secAverg};

            // Use console.table
            if (this.useTable) {
                console.info('PROFILER RESULTS FOR: ' + this.initName +' ');
                console.table(rows)
            }
            // Use console.log
            else {
                //get longest index
                var longIndex = 0
                for (var i in rows) {
                    if (!rows.hasOwnProperty(i))continue
                    if (i.length > longIndex)
                        longIndex = i.length
                }
                // generate output for each row
                var output = ''
                var breakLen = 60
                var breakLine = Array(breakLen).join('_')
                output += breakLine + '\r'
                output += '| Profiler: ' + this.initName + '\r'
                output += Array(breakLen).join('-')+ '\r'
                for (var i in rows) {
                    if (!rows.hasOwnProperty(i)) continue
                    row = rows[i]
                    var spacer = longIndex-i.length
                    if (spacer) spacer = Array(spacer).join(' ')
                    else spacer = ''
                    output += '| ['+i+']'+spacer+'  \t= [ms:' + row.ms + ']  \t[s:' + row.s + '] \r';
                }
                output += breakLine;
                console.log(output)
            }
        };



        return {
            _initPrototype: _initPrototype,
            start: start,
            stop: stop,
            group: group,
            active: active,
            printElapsed: printElapsed,
            printResults: printResults
        };
    }();

    return {Debugger:Debugger, Profiler:Profiler}
}()

// create a debugger for the root scope
window.iDebugger = new iDebugConsole.Debugger({window: this}, true)
debug('iDebugger ready: You can now use `debug` just like you would use `console`.')



