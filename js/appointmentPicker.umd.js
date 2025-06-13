(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('react-dom'), require('react-day-picker'), require('date-fns')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'react-dom', 'react-day-picker', 'date-fns'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mountAppointmentPicker = {}, global.React, global.ReactDOM, global.ReactDayPicker, global.dateFns));
})(this, (function (exports, React$1, ReactDOM, reactDayPicker, dateFns) { 'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React$1);

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  function Button({
    children,
    className = "",
    variant = "default",
    ...props
  }) {
    const baseStyles = "px-3 py-2 rounded text-sm font-medium transition";
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 text-gray-800 hover:bg-gray-100"
    };
    const variantClass = variants[variant] || variants.default;
    return /*#__PURE__*/React.createElement("button", _extends({
      className: `${baseStyles} ${variantClass} ${className}`
    }, props), children);
  }

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ".rdp-root{--rdp-accent-color:blue;--rdp-accent-background-color:#f0f0ff;--rdp-day-height:44px;--rdp-day-width:44px;--rdp-day_button-border-radius:100%;--rdp-day_button-border:2px solid transparent;--rdp-day_button-height:42px;--rdp-day_button-width:42px;--rdp-selected-border:2px solid var(--rdp-accent-color);--rdp-disabled-opacity:0.5;--rdp-outside-opacity:0.75;--rdp-today-color:var(--rdp-accent-color);--rdp-dropdown-gap:0.5rem;--rdp-months-gap:2rem;--rdp-nav_button-disabled-opacity:0.5;--rdp-nav_button-height:2.25rem;--rdp-nav_button-width:2.25rem;--rdp-nav-height:2.75rem;--rdp-range_middle-background-color:var(--rdp-accent-background-color);--rdp-range_middle-color:inherit;--rdp-range_start-color:#fff;--rdp-range_start-background:linear-gradient(var(--rdp-gradient-direction),transparent 50%,var(--rdp-range_middle-background-color) 50%);--rdp-range_start-date-background-color:var(--rdp-accent-color);--rdp-range_end-background:linear-gradient(var(--rdp-gradient-direction),var(--rdp-range_middle-background-color) 50%,transparent 50%);--rdp-range_end-color:#fff;--rdp-range_end-date-background-color:var(--rdp-accent-color);--rdp-week_number-border-radius:100%;--rdp-week_number-border:2px solid transparent;--rdp-week_number-height:var(--rdp-day-height);--rdp-week_number-opacity:0.75;--rdp-week_number-width:var(--rdp-day-width);--rdp-weeknumber-text-align:center;--rdp-weekday-opacity:0.75;--rdp-weekday-padding:0.5rem 0rem;--rdp-weekday-text-align:center;--rdp-gradient-direction:90deg;--rdp-animation_duration:0.3s;--rdp-animation_timing:cubic-bezier(0.4,0,0.2,1)}.rdp-root[dir=rtl]{--rdp-gradient-direction:-90deg}.rdp-root[data-broadcast-calendar=true]{--rdp-outside-opacity:unset}.rdp-root{position:relative}.rdp-root,.rdp-root *{box-sizing:border-box}.rdp-day{height:var(--rdp-day-height);text-align:center;width:var(--rdp-day-width)}.rdp-day_button{align-items:center;background:none;border:var(--rdp-day_button-border);border-radius:var(--rdp-day_button-border-radius);color:inherit;cursor:pointer;display:flex;font:inherit;height:var(--rdp-day_button-height);justify-content:center;margin:0;padding:0;width:var(--rdp-day_button-width)}.rdp-day_button:disabled{cursor:revert}.rdp-caption_label{align-items:center;border:0;display:inline-flex;position:relative;white-space:nowrap;z-index:1}.rdp-dropdown:focus-visible~.rdp-caption_label{outline:5px auto Highlight;outline:5px auto -webkit-focus-ring-color}.rdp-button_next,.rdp-button_previous{align-items:center;-moz-appearance:none;-webkit-appearance:none;appearance:none;background:none;border:none;color:inherit;cursor:pointer;display:inline-flex;font:inherit;height:var(--rdp-nav_button-height);justify-content:center;margin:0;padding:0;position:relative;width:var(--rdp-nav_button-width)}.rdp-button_next:disabled,.rdp-button_next[aria-disabled=true],.rdp-button_previous:disabled,.rdp-button_previous[aria-disabled=true]{cursor:revert;opacity:var(--rdp-nav_button-disabled-opacity)}.rdp-chevron{fill:var(--rdp-accent-color);display:inline-block}.rdp-root[dir=rtl] .rdp-nav .rdp-chevron{transform:rotate(180deg);transform-origin:50%}.rdp-dropdowns{align-items:center;display:inline-flex;gap:var(--rdp-dropdown-gap);position:relative}.rdp-dropdown{appearance:none;border:none;cursor:inherit;inset-block-end:0;inset-block-start:0;inset-inline-start:0;line-height:inherit;margin:0;opacity:0;padding:0;position:absolute;width:100%;z-index:2}.rdp-dropdown_root{align-items:center;display:inline-flex;position:relative}.rdp-dropdown_root[data-disabled=true] .rdp-chevron{opacity:var(--rdp-disabled-opacity)}.rdp-month_caption{align-content:center;display:flex;font-size:large;font-weight:700;height:var(--rdp-nav-height)}.rdp-root[data-nav-layout=after] .rdp-month,.rdp-root[data-nav-layout=around] .rdp-month{position:relative}.rdp-root[data-nav-layout=around] .rdp-month_caption{justify-content:center;margin-inline-end:var(--rdp-nav_button-width);margin-inline-start:var(--rdp-nav_button-width);position:relative}.rdp-root[data-nav-layout=around] .rdp-button_previous{display:inline-flex;height:var(--rdp-nav-height);inset-inline-start:0;position:absolute;top:0}.rdp-root[data-nav-layout=around] .rdp-button_next{display:inline-flex;height:var(--rdp-nav-height);inset-inline-end:0;justify-content:center;position:absolute;top:0}.rdp-months{display:flex;flex-wrap:wrap;gap:var(--rdp-months-gap);max-width:fit-content;position:relative}.rdp-month_grid{border-collapse:collapse}.rdp-nav{align-items:center;display:flex;height:var(--rdp-nav-height);inset-block-start:0;inset-inline-end:0;position:absolute}.rdp-weekday{font-size:smaller;font-weight:500;opacity:var(--rdp-weekday-opacity);padding:var(--rdp-weekday-padding);text-align:var(--rdp-weekday-text-align);text-transform:var(--rdp-weekday-text-transform)}.rdp-week_number{border:var(--rdp-week_number-border);border-radius:var(--rdp-week_number-border-radius);font-size:small;font-weight:400;height:var(--rdp-week_number-height);opacity:var(--rdp-week_number-opacity);text-align:var(--rdp-weeknumber-text-align);width:var(--rdp-week_number-width)}.rdp-today:not(.rdp-outside){color:var(--rdp-today-color)}.rdp-selected{font-size:large;font-weight:700}.rdp-selected .rdp-day_button{border:var(--rdp-selected-border)}.rdp-outside{opacity:var(--rdp-outside-opacity)}.rdp-disabled{opacity:var(--rdp-disabled-opacity)}.rdp-hidden{color:var(--rdp-range_start-color);visibility:hidden}.rdp-range_start{background:var(--rdp-range_start-background)}.rdp-range_start .rdp-day_button{background-color:var(--rdp-range_start-date-background-color);color:var(--rdp-range_start-color)}.rdp-range_middle{background-color:var(--rdp-range_middle-background-color)}.rdp-range_middle .rdp-day_button{border:unset;border-radius:unset;color:var(--rdp-range_middle-color)}.rdp-range_end{background:var(--rdp-range_end-background);color:var(--rdp-range_end-color)}.rdp-range_end .rdp-day_button{background-color:var(--rdp-range_end-date-background-color);color:var(--rdp-range_start-color)}.rdp-range_start.rdp-range_end{background:revert}.rdp-focusable{cursor:pointer}@keyframes rdp-slide_in_left{0%{transform:translateX(-100%)}to{transform:translateX(0)}}@keyframes rdp-slide_in_right{0%{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes rdp-slide_out_left{0%{transform:translateX(0)}to{transform:translateX(-100%)}}@keyframes rdp-slide_out_right{0%{transform:translateX(0)}to{transform:translateX(100%)}}.rdp-weeks_before_enter{animation:rdp-slide_in_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-weeks_before_exit{animation:rdp-slide_out_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-weeks_after_enter{animation:rdp-slide_in_right var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-weeks_after_exit{animation:rdp-slide_out_right var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-root[dir=rtl] .rdp-weeks_after_enter{animation:rdp-slide_in_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-root[dir=rtl] .rdp-weeks_before_exit{animation:rdp-slide_out_right var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-root[dir=rtl] .rdp-weeks_before_enter{animation:rdp-slide_in_right var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-root[dir=rtl] .rdp-weeks_after_exit{animation:rdp-slide_out_left var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}@keyframes rdp-fade_in{0%{opacity:0}to{opacity:1}}@keyframes rdp-fade_out{0%{opacity:1}to{opacity:0}}.rdp-caption_after_enter{animation:rdp-fade_in var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-caption_after_exit{animation:rdp-fade_out var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-caption_before_enter{animation:rdp-fade_in var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}.rdp-caption_before_exit{animation:rdp-fade_out var(--rdp-animation_duration) var(--rdp-animation_timing) forwards}";
  styleInject(css_248z);

  function Calendar({
    className,
    ...props
  }) {
    return /*#__PURE__*/React__namespace.createElement("div", {
      className: className
    }, /*#__PURE__*/React__namespace.createElement(reactDayPicker.DayPicker, props));
  }

  function ScrollArea({
    children,
    className = ""
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: `scroll-area ${className}`,
      style: {
        overflowY: "auto",
        maxHeight: "300px"
      }
    }, children);
  }

  function AppointmentPicker() {
    const today = new Date();
    const [date, setDate] = React$1.useState(today);
    const [time, setTime] = React$1.useState(null);
    const timeSlots = [{
      time: "09:00",
      available: false
    }, {
      time: "09:30",
      available: false
    }, {
      time: "10:00",
      available: true
    }, {
      time: "10:30",
      available: true
    }, {
      time: "11:00",
      available: true
    }, {
      time: "11:30",
      available: true
    }, {
      time: "12:00",
      available: false
    }, {
      time: "12:30",
      available: true
    }, {
      time: "13:00",
      available: true
    }, {
      time: "13:30",
      available: true
    }, {
      time: "14:00",
      available: true
    }, {
      time: "14:30",
      available: false
    }, {
      time: "15:00",
      available: false
    }, {
      time: "15:30",
      available: true
    }, {
      time: "16:00",
      available: true
    }, {
      time: "16:30",
      available: true
    }, {
      time: "17:00",
      available: true
    }, {
      time: "17:30",
      available: true
    }];
    return /*#__PURE__*/React$1.createElement("div", {
      className: "rounded-lg border border-border p-4 bg-white"
    }, /*#__PURE__*/React$1.createElement("div", {
      className: "flex max-sm:flex-col gap-4"
    }, /*#__PURE__*/React$1.createElement(Calendar, {
      mode: "single",
      selected: date,
      onSelect: d => {
        if (d) {
          setDate(d);
          setTime(null);
        }
      },
      className: "p-2 bg-background",
      disabled: [{
        before: today
      }]
    }), /*#__PURE__*/React$1.createElement("div", {
      className: "relative w-full max-sm:h-48 sm:w-40"
    }, /*#__PURE__*/React$1.createElement(ScrollArea, {
      className: "h-full py-4 border-t sm:border-l border-border"
    }, /*#__PURE__*/React$1.createElement("div", {
      className: "space-y-3"
    }, /*#__PURE__*/React$1.createElement("div", {
      className: "px-5"
    }, /*#__PURE__*/React$1.createElement("p", {
      className: "text-sm font-medium"
    }, dateFns.format(date, "EEEE, d"))), /*#__PURE__*/React$1.createElement("div", {
      className: "grid gap-1.5 px-5 max-sm:grid-cols-2"
    }, timeSlots.map(({
      time: ts,
      available
    }) => /*#__PURE__*/React$1.createElement(Button, {
      key: ts,
      variant: time === ts ? "default" : "outline",
      size: "sm",
      className: "w-full",
      onClick: () => setTime(ts),
      disabled: !available
    }, ts))))))), /*#__PURE__*/React$1.createElement("p", {
      className: "mt-4 text-center text-xs text-muted-foreground",
      role: "region",
      "aria-live": "polite"
    }, "Selected: ", time || "none", /*#__PURE__*/React$1.createElement("br", null), "Appointment picker powered by React DayPicker."));
  }

  function mountAppointmentPicker(containerElementId, props) {
    // Changed signature
    const container = document.getElementById(containerElementId); // Get element by ID
    if (!container) {
      // Check if container was found
      console.error(`Mount container element with ID '${containerElementId}' not found.`);
      return;
    }
    // Ensure props are passed to AppointmentPicker, and container is the actual DOM element
    ReactDOM.render(/*#__PURE__*/React$1.createElement(AppointmentPicker, props), container);
  }

  // Expose the mount function to the global window object
  if (typeof window !== 'undefined') {
    window.mountAppointmentPicker = mountAppointmentPicker;
  }

  exports.mountAppointmentPicker = mountAppointmentPicker;

}));
