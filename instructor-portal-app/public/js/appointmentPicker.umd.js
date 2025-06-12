(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('react-day-picker'), require('react-dom'), require('date-fns')) :
  typeof define === 'function' && define.amd ? define(['react', 'react-day-picker', 'react-dom', 'date-fns'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mountAppointmentPicker = factory(global.React, global.ReactDayPicker, global.ReactDOM, global.dateFns));
})(this, (function (React2, reactDayPicker, ReactDOM, dateFns) { 'use strict';

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

  var React2__namespace = /*#__PURE__*/_interopNamespaceDefault(React2);

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  // packages/react/compose-refs/src/compose-refs.tsx
  function setRef(ref, value) {
    if (typeof ref === "function") {
      return ref(value);
    } else if (ref !== null && ref !== void 0) {
      ref.current = value;
    }
  }
  function composeRefs(...refs) {
    return (node) => {
      let hasCleanup = false;
      const cleanups = refs.map((ref) => {
        const cleanup = setRef(ref, node);
        if (!hasCleanup && typeof cleanup == "function") {
          hasCleanup = true;
        }
        return cleanup;
      });
      if (hasCleanup) {
        return () => {
          for (let i = 0; i < cleanups.length; i++) {
            const cleanup = cleanups[i];
            if (typeof cleanup == "function") {
              cleanup();
            } else {
              setRef(refs[i], null);
            }
          }
        };
      }
    };
  }
  function useComposedRefs(...refs) {
    return React2__namespace.useCallback(composeRefs(...refs), refs);
  }

  var jsxRuntime = {exports: {}};

  var reactJsxRuntime_production = {};

  /**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var hasRequiredReactJsxRuntime_production;

  function requireReactJsxRuntime_production () {
  	if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
  	hasRequiredReactJsxRuntime_production = 1;
  	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  	  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  	function jsxProd(type, config, maybeKey) {
  	  var key = null;
  	  void 0 !== maybeKey && (key = "" + maybeKey);
  	  void 0 !== config.key && (key = "" + config.key);
  	  if ("key" in config) {
  	    maybeKey = {};
  	    for (var propName in config)
  	      "key" !== propName && (maybeKey[propName] = config[propName]);
  	  } else maybeKey = config;
  	  config = maybeKey.ref;
  	  return {
  	    $$typeof: REACT_ELEMENT_TYPE,
  	    type: type,
  	    key: key,
  	    ref: void 0 !== config ? config : null,
  	    props: maybeKey
  	  };
  	}
  	reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
  	reactJsxRuntime_production.jsx = jsxProd;
  	reactJsxRuntime_production.jsxs = jsxProd;
  	return reactJsxRuntime_production;
  }

  var reactJsxRuntime_development = {};

  /**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var hasRequiredReactJsxRuntime_development;

  function requireReactJsxRuntime_development () {
  	if (hasRequiredReactJsxRuntime_development) return reactJsxRuntime_development;
  	hasRequiredReactJsxRuntime_development = 1;
  	"production" !== process.env.NODE_ENV &&
  	  (function () {
  	    function getComponentNameFromType(type) {
  	      if (null == type) return null;
  	      if ("function" === typeof type)
  	        return type.$$typeof === REACT_CLIENT_REFERENCE
  	          ? null
  	          : type.displayName || type.name || null;
  	      if ("string" === typeof type) return type;
  	      switch (type) {
  	        case REACT_FRAGMENT_TYPE:
  	          return "Fragment";
  	        case REACT_PROFILER_TYPE:
  	          return "Profiler";
  	        case REACT_STRICT_MODE_TYPE:
  	          return "StrictMode";
  	        case REACT_SUSPENSE_TYPE:
  	          return "Suspense";
  	        case REACT_SUSPENSE_LIST_TYPE:
  	          return "SuspenseList";
  	        case REACT_ACTIVITY_TYPE:
  	          return "Activity";
  	      }
  	      if ("object" === typeof type)
  	        switch (
  	          ("number" === typeof type.tag &&
  	            console.error(
  	              "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
  	            ),
  	          type.$$typeof)
  	        ) {
  	          case REACT_PORTAL_TYPE:
  	            return "Portal";
  	          case REACT_CONTEXT_TYPE:
  	            return (type.displayName || "Context") + ".Provider";
  	          case REACT_CONSUMER_TYPE:
  	            return (type._context.displayName || "Context") + ".Consumer";
  	          case REACT_FORWARD_REF_TYPE:
  	            var innerType = type.render;
  	            type = type.displayName;
  	            type ||
  	              ((type = innerType.displayName || innerType.name || ""),
  	              (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
  	            return type;
  	          case REACT_MEMO_TYPE:
  	            return (
  	              (innerType = type.displayName || null),
  	              null !== innerType
  	                ? innerType
  	                : getComponentNameFromType(type.type) || "Memo"
  	            );
  	          case REACT_LAZY_TYPE:
  	            innerType = type._payload;
  	            type = type._init;
  	            try {
  	              return getComponentNameFromType(type(innerType));
  	            } catch (x) {}
  	        }
  	      return null;
  	    }
  	    function testStringCoercion(value) {
  	      return "" + value;
  	    }
  	    function checkKeyStringCoercion(value) {
  	      try {
  	        testStringCoercion(value);
  	        var JSCompiler_inline_result = !1;
  	      } catch (e) {
  	        JSCompiler_inline_result = true;
  	      }
  	      if (JSCompiler_inline_result) {
  	        JSCompiler_inline_result = console;
  	        var JSCompiler_temp_const = JSCompiler_inline_result.error;
  	        var JSCompiler_inline_result$jscomp$0 =
  	          ("function" === typeof Symbol &&
  	            Symbol.toStringTag &&
  	            value[Symbol.toStringTag]) ||
  	          value.constructor.name ||
  	          "Object";
  	        JSCompiler_temp_const.call(
  	          JSCompiler_inline_result,
  	          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
  	          JSCompiler_inline_result$jscomp$0
  	        );
  	        return testStringCoercion(value);
  	      }
  	    }
  	    function getTaskName(type) {
  	      if (type === REACT_FRAGMENT_TYPE) return "<>";
  	      if (
  	        "object" === typeof type &&
  	        null !== type &&
  	        type.$$typeof === REACT_LAZY_TYPE
  	      )
  	        return "<...>";
  	      try {
  	        var name = getComponentNameFromType(type);
  	        return name ? "<" + name + ">" : "<...>";
  	      } catch (x) {
  	        return "<...>";
  	      }
  	    }
  	    function getOwner() {
  	      var dispatcher = ReactSharedInternals.A;
  	      return null === dispatcher ? null : dispatcher.getOwner();
  	    }
  	    function UnknownOwner() {
  	      return Error("react-stack-top-frame");
  	    }
  	    function hasValidKey(config) {
  	      if (hasOwnProperty.call(config, "key")) {
  	        var getter = Object.getOwnPropertyDescriptor(config, "key").get;
  	        if (getter && getter.isReactWarning) return false;
  	      }
  	      return void 0 !== config.key;
  	    }
  	    function defineKeyPropWarningGetter(props, displayName) {
  	      function warnAboutAccessingKey() {
  	        specialPropKeyWarningShown ||
  	          ((specialPropKeyWarningShown = true),
  	          console.error(
  	            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
  	            displayName
  	          ));
  	      }
  	      warnAboutAccessingKey.isReactWarning = true;
  	      Object.defineProperty(props, "key", {
  	        get: warnAboutAccessingKey,
  	        configurable: true
  	      });
  	    }
  	    function elementRefGetterWithDeprecationWarning() {
  	      var componentName = getComponentNameFromType(this.type);
  	      didWarnAboutElementRef[componentName] ||
  	        ((didWarnAboutElementRef[componentName] = true),
  	        console.error(
  	          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
  	        ));
  	      componentName = this.props.ref;
  	      return void 0 !== componentName ? componentName : null;
  	    }
  	    function ReactElement(
  	      type,
  	      key,
  	      self,
  	      source,
  	      owner,
  	      props,
  	      debugStack,
  	      debugTask
  	    ) {
  	      self = props.ref;
  	      type = {
  	        $$typeof: REACT_ELEMENT_TYPE,
  	        type: type,
  	        key: key,
  	        props: props,
  	        _owner: owner
  	      };
  	      null !== (void 0 !== self ? self : null)
  	        ? Object.defineProperty(type, "ref", {
  	            enumerable: false,
  	            get: elementRefGetterWithDeprecationWarning
  	          })
  	        : Object.defineProperty(type, "ref", { enumerable: false, value: null });
  	      type._store = {};
  	      Object.defineProperty(type._store, "validated", {
  	        configurable: false,
  	        enumerable: false,
  	        writable: true,
  	        value: 0
  	      });
  	      Object.defineProperty(type, "_debugInfo", {
  	        configurable: false,
  	        enumerable: false,
  	        writable: true,
  	        value: null
  	      });
  	      Object.defineProperty(type, "_debugStack", {
  	        configurable: false,
  	        enumerable: false,
  	        writable: true,
  	        value: debugStack
  	      });
  	      Object.defineProperty(type, "_debugTask", {
  	        configurable: false,
  	        enumerable: false,
  	        writable: true,
  	        value: debugTask
  	      });
  	      Object.freeze && (Object.freeze(type.props), Object.freeze(type));
  	      return type;
  	    }
  	    function jsxDEVImpl(
  	      type,
  	      config,
  	      maybeKey,
  	      isStaticChildren,
  	      source,
  	      self,
  	      debugStack,
  	      debugTask
  	    ) {
  	      var children = config.children;
  	      if (void 0 !== children)
  	        if (isStaticChildren)
  	          if (isArrayImpl(children)) {
  	            for (
  	              isStaticChildren = 0;
  	              isStaticChildren < children.length;
  	              isStaticChildren++
  	            )
  	              validateChildKeys(children[isStaticChildren]);
  	            Object.freeze && Object.freeze(children);
  	          } else
  	            console.error(
  	              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
  	            );
  	        else validateChildKeys(children);
  	      if (hasOwnProperty.call(config, "key")) {
  	        children = getComponentNameFromType(type);
  	        var keys = Object.keys(config).filter(function (k) {
  	          return "key" !== k;
  	        });
  	        isStaticChildren =
  	          0 < keys.length
  	            ? "{key: someKey, " + keys.join(": ..., ") + ": ...}"
  	            : "{key: someKey}";
  	        didWarnAboutKeySpread[children + isStaticChildren] ||
  	          ((keys =
  	            0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}"),
  	          console.error(
  	            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
  	            isStaticChildren,
  	            children,
  	            keys,
  	            children
  	          ),
  	          (didWarnAboutKeySpread[children + isStaticChildren] = true));
  	      }
  	      children = null;
  	      void 0 !== maybeKey &&
  	        (checkKeyStringCoercion(maybeKey), (children = "" + maybeKey));
  	      hasValidKey(config) &&
  	        (checkKeyStringCoercion(config.key), (children = "" + config.key));
  	      if ("key" in config) {
  	        maybeKey = {};
  	        for (var propName in config)
  	          "key" !== propName && (maybeKey[propName] = config[propName]);
  	      } else maybeKey = config;
  	      children &&
  	        defineKeyPropWarningGetter(
  	          maybeKey,
  	          "function" === typeof type
  	            ? type.displayName || type.name || "Unknown"
  	            : type
  	        );
  	      return ReactElement(
  	        type,
  	        children,
  	        self,
  	        source,
  	        getOwner(),
  	        maybeKey,
  	        debugStack,
  	        debugTask
  	      );
  	    }
  	    function validateChildKeys(node) {
  	      "object" === typeof node &&
  	        null !== node &&
  	        node.$$typeof === REACT_ELEMENT_TYPE &&
  	        node._store &&
  	        (node._store.validated = 1);
  	    }
  	    var React = React2,
  	      REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  	      REACT_PORTAL_TYPE = Symbol.for("react.portal"),
  	      REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
  	      REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
  	      REACT_PROFILER_TYPE = Symbol.for("react.profiler");
  	    var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
  	      REACT_CONTEXT_TYPE = Symbol.for("react.context"),
  	      REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
  	      REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
  	      REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
  	      REACT_MEMO_TYPE = Symbol.for("react.memo"),
  	      REACT_LAZY_TYPE = Symbol.for("react.lazy"),
  	      REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
  	      REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"),
  	      ReactSharedInternals =
  	        React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  	      hasOwnProperty = Object.prototype.hasOwnProperty,
  	      isArrayImpl = Array.isArray,
  	      createTask = console.createTask
  	        ? console.createTask
  	        : function () {
  	            return null;
  	          };
  	    React = {
  	      "react-stack-bottom-frame": function (callStackForError) {
  	        return callStackForError();
  	      }
  	    };
  	    var specialPropKeyWarningShown;
  	    var didWarnAboutElementRef = {};
  	    var unknownOwnerDebugStack = React["react-stack-bottom-frame"].bind(
  	      React,
  	      UnknownOwner
  	    )();
  	    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
  	    var didWarnAboutKeySpread = {};
  	    reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
  	    reactJsxRuntime_development.jsx = function (type, config, maybeKey, source, self) {
  	      var trackActualOwner =
  	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
  	      return jsxDEVImpl(
  	        type,
  	        config,
  	        maybeKey,
  	        false,
  	        source,
  	        self,
  	        trackActualOwner
  	          ? Error("react-stack-top-frame")
  	          : unknownOwnerDebugStack,
  	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
  	      );
  	    };
  	    reactJsxRuntime_development.jsxs = function (type, config, maybeKey, source, self) {
  	      var trackActualOwner =
  	        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
  	      return jsxDEVImpl(
  	        type,
  	        config,
  	        maybeKey,
  	        true,
  	        source,
  	        self,
  	        trackActualOwner
  	          ? Error("react-stack-top-frame")
  	          : unknownOwnerDebugStack,
  	        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
  	      );
  	    };
  	  })();
  	return reactJsxRuntime_development;
  }

  var hasRequiredJsxRuntime;

  function requireJsxRuntime () {
  	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  	hasRequiredJsxRuntime = 1;

  	if (process.env.NODE_ENV === 'production') {
  	  jsxRuntime.exports = requireReactJsxRuntime_production();
  	} else {
  	  jsxRuntime.exports = requireReactJsxRuntime_development();
  	}
  	return jsxRuntime.exports;
  }

  var jsxRuntimeExports = requireJsxRuntime();

  // src/slot.tsx
  // @__NO_SIDE_EFFECTS__
  function createSlot(ownerName) {
    const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
    const Slot2 = React2__namespace.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      const childrenArray = React2__namespace.Children.toArray(children);
      const slottable = childrenArray.find(isSlottable);
      if (slottable) {
        const newElement = slottable.props.children;
        const newChildren = childrenArray.map((child) => {
          if (child === slottable) {
            if (React2__namespace.Children.count(newElement) > 1) return React2__namespace.Children.only(null);
            return React2__namespace.isValidElement(newElement) ? newElement.props.children : null;
          } else {
            return child;
          }
        });
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React2__namespace.isValidElement(newElement) ? React2__namespace.cloneElement(newElement, void 0, newChildren) : null });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
    });
    Slot2.displayName = `${ownerName}.Slot`;
    return Slot2;
  }
  var Slot = /* @__PURE__ */ createSlot("Slot");
  // @__NO_SIDE_EFFECTS__
  function createSlotClone(ownerName) {
    const SlotClone = React2__namespace.forwardRef((props, forwardedRef) => {
      const { children, ...slotProps } = props;
      if (React2__namespace.isValidElement(children)) {
        const childrenRef = getElementRef$1(children);
        const props2 = mergeProps(slotProps, children.props);
        if (children.type !== React2__namespace.Fragment) {
          props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
        }
        return React2__namespace.cloneElement(children, props2);
      }
      return React2__namespace.Children.count(children) > 1 ? React2__namespace.Children.only(null) : null;
    });
    SlotClone.displayName = `${ownerName}.SlotClone`;
    return SlotClone;
  }
  var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
  function isSlottable(child) {
    return React2__namespace.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
  }
  function mergeProps(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
      const slotPropValue = slotProps[propName];
      const childPropValue = childProps[propName];
      const isHandler = /^on[A-Z]/.test(propName);
      if (isHandler) {
        if (slotPropValue && childPropValue) {
          overrideProps[propName] = (...args) => {
            const result = childPropValue(...args);
            slotPropValue(...args);
            return result;
          };
        } else if (slotPropValue) {
          overrideProps[propName] = slotPropValue;
        }
      } else if (propName === "style") {
        overrideProps[propName] = { ...slotPropValue, ...childPropValue };
      } else if (propName === "className") {
        overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
      }
    }
    return { ...slotProps, ...overrideProps };
  }
  function getElementRef$1(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }

  function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}

  const falsyToString = (value)=>typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
  const cx = clsx;
  const cva = (base, config)=>(props)=>{
          var _config_compoundVariants;
          if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
          const { variants, defaultVariants } = config;
          const getVariantClassNames = Object.keys(variants).map((variant)=>{
              const variantProp = props === null || props === void 0 ? void 0 : props[variant];
              const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
              if (variantProp === null) return null;
              const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
              return variants[variant][variantKey];
          });
          const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param)=>{
              let [key, value] = param;
              if (value === undefined) {
                  return acc;
              }
              acc[key] = value;
              return acc;
          }, {});
          const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param)=>{
              let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
              return Object.entries(compoundVariantOptions).every((param)=>{
                  let [key, value] = param;
                  return Array.isArray(value) ? value.includes({
                      ...defaultVariants,
                      ...propsWithoutUndefined
                  }[key]) : ({
                      ...defaultVariants,
                      ...propsWithoutUndefined
                  })[key] === value;
              }) ? [
                  ...acc,
                  cvClass,
                  cvClassName
              ] : acc;
          }, []);
          return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
      };

  // lib/utils.js

  /**
   * Simple class-names joiner: filters out falsy values and joins the rest.
   *
   * @param  {...(string|false|undefined|null)} classes
   * @returns {string}
   */
  function cn(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  });
  function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
  }) {
    const Comp = asChild ? Slot : "button";
    return /*#__PURE__*/React2__namespace.createElement(Comp, _extends({
      "data-slot": "button",
      className: cn(buttonVariants({
        variant,
        size,
        className
      }))
    }, props));
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

  /**
   * A simple wrapper around react-day-picker’s DayPicker.
   * Accepts all DayPicker props, plus:
   *  - mode="single"
   *  - selected (JS Date)
   *  - onSelect (handler)
   */
  function Calendar(props) {
    return /*#__PURE__*/React2.createElement(reactDayPicker.DayPicker, props);
  }

  // src/primitive.tsx
  var NODES = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul"
  ];
  var Primitive = NODES.reduce((primitive, node) => {
    const Slot = createSlot(`Primitive.${node}`);
    const Node = React2__namespace.forwardRef((props, forwardedRef) => {
      const { asChild, ...primitiveProps } = props;
      const Comp = asChild ? Slot : node;
      if (typeof window !== "undefined") {
        window[Symbol.for("radix-ui")] = true;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { ...primitiveProps, ref: forwardedRef });
    });
    Node.displayName = `Primitive.${node}`;
    return { ...primitive, [node]: Node };
  }, {});

  // packages/react/use-layout-effect/src/use-layout-effect.tsx
  var useLayoutEffect2 = globalThis?.document ? React2__namespace.useLayoutEffect : () => {
  };

  function useStateMachine$1(initialState, machine) {
    return React2__namespace.useReducer((state, event) => {
      const nextState = machine[state][event];
      return nextState ?? state;
    }, initialState);
  }

  // src/presence.tsx
  var Presence = (props) => {
    const { present, children } = props;
    const presence = usePresence(present);
    const child = typeof children === "function" ? children({ present: presence.isPresent }) : React2__namespace.Children.only(children);
    const ref = useComposedRefs(presence.ref, getElementRef(child));
    const forceMount = typeof children === "function";
    return forceMount || presence.isPresent ? React2__namespace.cloneElement(child, { ref }) : null;
  };
  Presence.displayName = "Presence";
  function usePresence(present) {
    const [node, setNode] = React2__namespace.useState();
    const stylesRef = React2__namespace.useRef(null);
    const prevPresentRef = React2__namespace.useRef(present);
    const prevAnimationNameRef = React2__namespace.useRef("none");
    const initialState = present ? "mounted" : "unmounted";
    const [state, send] = useStateMachine$1(initialState, {
      mounted: {
        UNMOUNT: "unmounted",
        ANIMATION_OUT: "unmountSuspended"
      },
      unmountSuspended: {
        MOUNT: "mounted",
        ANIMATION_END: "unmounted"
      },
      unmounted: {
        MOUNT: "mounted"
      }
    });
    React2__namespace.useEffect(() => {
      const currentAnimationName = getAnimationName(stylesRef.current);
      prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
    }, [state]);
    useLayoutEffect2(() => {
      const styles = stylesRef.current;
      const wasPresent = prevPresentRef.current;
      const hasPresentChanged = wasPresent !== present;
      if (hasPresentChanged) {
        const prevAnimationName = prevAnimationNameRef.current;
        const currentAnimationName = getAnimationName(styles);
        if (present) {
          send("MOUNT");
        } else if (currentAnimationName === "none" || styles?.display === "none") {
          send("UNMOUNT");
        } else {
          const isAnimating = prevAnimationName !== currentAnimationName;
          if (wasPresent && isAnimating) {
            send("ANIMATION_OUT");
          } else {
            send("UNMOUNT");
          }
        }
        prevPresentRef.current = present;
      }
    }, [present, send]);
    useLayoutEffect2(() => {
      if (node) {
        let timeoutId;
        const ownerWindow = node.ownerDocument.defaultView ?? window;
        const handleAnimationEnd = (event) => {
          const currentAnimationName = getAnimationName(stylesRef.current);
          const isCurrentAnimation = currentAnimationName.includes(event.animationName);
          if (event.target === node && isCurrentAnimation) {
            send("ANIMATION_END");
            if (!prevPresentRef.current) {
              const currentFillMode = node.style.animationFillMode;
              node.style.animationFillMode = "forwards";
              timeoutId = ownerWindow.setTimeout(() => {
                if (node.style.animationFillMode === "forwards") {
                  node.style.animationFillMode = currentFillMode;
                }
              });
            }
          }
        };
        const handleAnimationStart = (event) => {
          if (event.target === node) {
            prevAnimationNameRef.current = getAnimationName(stylesRef.current);
          }
        };
        node.addEventListener("animationstart", handleAnimationStart);
        node.addEventListener("animationcancel", handleAnimationEnd);
        node.addEventListener("animationend", handleAnimationEnd);
        return () => {
          ownerWindow.clearTimeout(timeoutId);
          node.removeEventListener("animationstart", handleAnimationStart);
          node.removeEventListener("animationcancel", handleAnimationEnd);
          node.removeEventListener("animationend", handleAnimationEnd);
        };
      } else {
        send("ANIMATION_END");
      }
    }, [node, send]);
    return {
      isPresent: ["mounted", "unmountSuspended"].includes(state),
      ref: React2__namespace.useCallback((node2) => {
        stylesRef.current = node2 ? getComputedStyle(node2) : null;
        setNode(node2);
      }, [])
    };
  }
  function getAnimationName(styles) {
    return styles?.animationName || "none";
  }
  function getElementRef(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }

  // packages/react/context/src/create-context.tsx
  function createContextScope(scopeName, createContextScopeDeps = []) {
    let defaultContexts = [];
    function createContext3(rootComponentName, defaultContext) {
      const BaseContext = React2__namespace.createContext(defaultContext);
      const index = defaultContexts.length;
      defaultContexts = [...defaultContexts, defaultContext];
      const Provider = (props) => {
        const { scope, children, ...context } = props;
        const Context = scope?.[scopeName]?.[index] || BaseContext;
        const value = React2__namespace.useMemo(() => context, Object.values(context));
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Context.Provider, { value, children });
      };
      Provider.displayName = rootComponentName + "Provider";
      function useContext2(consumerName, scope) {
        const Context = scope?.[scopeName]?.[index] || BaseContext;
        const context = React2__namespace.useContext(Context);
        if (context) return context;
        if (defaultContext !== void 0) return defaultContext;
        throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
      }
      return [Provider, useContext2];
    }
    const createScope = () => {
      const scopeContexts = defaultContexts.map((defaultContext) => {
        return React2__namespace.createContext(defaultContext);
      });
      return function useScope(scope) {
        const contexts = scope?.[scopeName] || scopeContexts;
        return React2__namespace.useMemo(
          () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
          [scope, contexts]
        );
      };
    };
    createScope.scopeName = scopeName;
    return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
  }
  function composeContextScopes(...scopes) {
    const baseScope = scopes[0];
    if (scopes.length === 1) return baseScope;
    const createScope = () => {
      const scopeHooks = scopes.map((createScope2) => ({
        useScope: createScope2(),
        scopeName: createScope2.scopeName
      }));
      return function useComposedScopes(overrideScopes) {
        const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
          const scopeProps = useScope(overrideScopes);
          const currentScope = scopeProps[`__scope${scopeName}`];
          return { ...nextScopes2, ...currentScope };
        }, {});
        return React2__namespace.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
      };
    };
    createScope.scopeName = baseScope.scopeName;
    return createScope;
  }

  // packages/react/use-callback-ref/src/use-callback-ref.tsx
  function useCallbackRef(callback) {
    const callbackRef = React2__namespace.useRef(callback);
    React2__namespace.useEffect(() => {
      callbackRef.current = callback;
    });
    return React2__namespace.useMemo(() => (...args) => callbackRef.current?.(...args), []);
  }

  // packages/react/direction/src/direction.tsx
  var DirectionContext = React2__namespace.createContext(void 0);
  function useDirection(localDir) {
    const globalDir = React2__namespace.useContext(DirectionContext);
    return localDir || globalDir || "ltr";
  }

  // packages/core/number/src/number.ts
  function clamp(value, [min, max]) {
    return Math.min(max, Math.max(min, value));
  }

  // packages/core/primitive/src/primitive.tsx
  function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
    return function handleEvent(event) {
      originalEventHandler?.(event);
      if (checkForDefaultPrevented === false || !event.defaultPrevented) {
        return ourEventHandler?.(event);
      }
    };
  }

  function useStateMachine(initialState, machine) {
    return React2__namespace.useReducer((state, event) => {
      const nextState = machine[state][event];
      return nextState ?? state;
    }, initialState);
  }
  var SCROLL_AREA_NAME = "ScrollArea";
  var [createScrollAreaContext, createScrollAreaScope] = createContextScope(SCROLL_AREA_NAME);
  var [ScrollAreaProvider, useScrollAreaContext] = createScrollAreaContext(SCROLL_AREA_NAME);
  var ScrollArea$1 = React2__namespace.forwardRef(
    (props, forwardedRef) => {
      const {
        __scopeScrollArea,
        type = "hover",
        dir,
        scrollHideDelay = 600,
        ...scrollAreaProps
      } = props;
      const [scrollArea, setScrollArea] = React2__namespace.useState(null);
      const [viewport, setViewport] = React2__namespace.useState(null);
      const [content, setContent] = React2__namespace.useState(null);
      const [scrollbarX, setScrollbarX] = React2__namespace.useState(null);
      const [scrollbarY, setScrollbarY] = React2__namespace.useState(null);
      const [cornerWidth, setCornerWidth] = React2__namespace.useState(0);
      const [cornerHeight, setCornerHeight] = React2__namespace.useState(0);
      const [scrollbarXEnabled, setScrollbarXEnabled] = React2__namespace.useState(false);
      const [scrollbarYEnabled, setScrollbarYEnabled] = React2__namespace.useState(false);
      const composedRefs = useComposedRefs(forwardedRef, (node) => setScrollArea(node));
      const direction = useDirection(dir);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScrollAreaProvider,
        {
          scope: __scopeScrollArea,
          type,
          dir: direction,
          scrollHideDelay,
          scrollArea,
          viewport,
          onViewportChange: setViewport,
          content,
          onContentChange: setContent,
          scrollbarX,
          onScrollbarXChange: setScrollbarX,
          scrollbarXEnabled,
          onScrollbarXEnabledChange: setScrollbarXEnabled,
          scrollbarY,
          onScrollbarYChange: setScrollbarY,
          scrollbarYEnabled,
          onScrollbarYEnabledChange: setScrollbarYEnabled,
          onCornerWidthChange: setCornerWidth,
          onCornerHeightChange: setCornerHeight,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Primitive.div,
            {
              dir: direction,
              ...scrollAreaProps,
              ref: composedRefs,
              style: {
                position: "relative",
                // Pass corner sizes as CSS vars to reduce re-renders of context consumers
                ["--radix-scroll-area-corner-width"]: cornerWidth + "px",
                ["--radix-scroll-area-corner-height"]: cornerHeight + "px",
                ...props.style
              }
            }
          )
        }
      );
    }
  );
  ScrollArea$1.displayName = SCROLL_AREA_NAME;
  var VIEWPORT_NAME = "ScrollAreaViewport";
  var ScrollAreaViewport = React2__namespace.forwardRef(
    (props, forwardedRef) => {
      const { __scopeScrollArea, children, nonce, ...viewportProps } = props;
      const context = useScrollAreaContext(VIEWPORT_NAME, __scopeScrollArea);
      const ref = React2__namespace.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref, context.onViewportChange);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "style",
          {
            dangerouslySetInnerHTML: {
              __html: `[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`
            },
            nonce
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            "data-radix-scroll-area-viewport": "",
            ...viewportProps,
            ref: composedRefs,
            style: {
              /**
               * We don't support `visible` because the intention is to have at least one scrollbar
               * if this component is used and `visible` will behave like `auto` in that case
               * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
               *
               * We don't handle `auto` because the intention is for the native implementation
               * to be hidden if using this component. We just want to ensure the node is scrollable
               * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
               * the browser from having to work out whether to render native scrollbars or not,
               * we tell it to with the intention of hiding them in CSS.
               */
              overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
              overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
              ...props.style
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: context.onContentChange, style: { minWidth: "100%", display: "table" }, children })
          }
        )
      ] });
    }
  );
  ScrollAreaViewport.displayName = VIEWPORT_NAME;
  var SCROLLBAR_NAME = "ScrollAreaScrollbar";
  var ScrollAreaScrollbar = React2__namespace.forwardRef(
    (props, forwardedRef) => {
      const { forceMount, ...scrollbarProps } = props;
      const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
      const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
      const isHorizontal = props.orientation === "horizontal";
      React2__namespace.useEffect(() => {
        isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true);
        return () => {
          isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false);
        };
      }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange]);
      return context.type === "hover" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarHover, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "scroll" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarScroll, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "auto" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarAuto, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "always" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaScrollbarVisible, { ...scrollbarProps, ref: forwardedRef }) : null;
    }
  );
  ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;
  var ScrollAreaScrollbarHover = React2__namespace.forwardRef((props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const [visible, setVisible] = React2__namespace.useState(false);
    React2__namespace.useEffect(() => {
      const scrollArea = context.scrollArea;
      let hideTimer = 0;
      if (scrollArea) {
        const handlePointerEnter = () => {
          window.clearTimeout(hideTimer);
          setVisible(true);
        };
        const handlePointerLeave = () => {
          hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay);
        };
        scrollArea.addEventListener("pointerenter", handlePointerEnter);
        scrollArea.addEventListener("pointerleave", handlePointerLeave);
        return () => {
          window.clearTimeout(hideTimer);
          scrollArea.removeEventListener("pointerenter", handlePointerEnter);
          scrollArea.removeEventListener("pointerleave", handlePointerLeave);
        };
      }
    }, [context.scrollArea, context.scrollHideDelay]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaScrollbarAuto,
      {
        "data-state": visible ? "visible" : "hidden",
        ...scrollbarProps,
        ref: forwardedRef
      }
    ) });
  });
  var ScrollAreaScrollbarScroll = React2__namespace.forwardRef((props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const isHorizontal = props.orientation === "horizontal";
    const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
    const [state, send] = useStateMachine("hidden", {
      hidden: {
        SCROLL: "scrolling"
      },
      scrolling: {
        SCROLL_END: "idle",
        POINTER_ENTER: "interacting"
      },
      interacting: {
        SCROLL: "interacting",
        POINTER_LEAVE: "idle"
      },
      idle: {
        HIDE: "hidden",
        SCROLL: "scrolling",
        POINTER_ENTER: "interacting"
      }
    });
    React2__namespace.useEffect(() => {
      if (state === "idle") {
        const hideTimer = window.setTimeout(() => send("HIDE"), context.scrollHideDelay);
        return () => window.clearTimeout(hideTimer);
      }
    }, [state, context.scrollHideDelay, send]);
    React2__namespace.useEffect(() => {
      const viewport = context.viewport;
      const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";
      if (viewport) {
        let prevScrollPos = viewport[scrollDirection];
        const handleScroll = () => {
          const scrollPos = viewport[scrollDirection];
          const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
          if (hasScrollInDirectionChanged) {
            send("SCROLL");
            debounceScrollEnd();
          }
          prevScrollPos = scrollPos;
        };
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    }, [context.viewport, isHorizontal, send, debounceScrollEnd]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || state !== "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaScrollbarVisible,
      {
        "data-state": state === "hidden" ? "hidden" : "visible",
        ...scrollbarProps,
        ref: forwardedRef,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, () => send("POINTER_ENTER")),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, () => send("POINTER_LEAVE"))
      }
    ) });
  });
  var ScrollAreaScrollbarAuto = React2__namespace.forwardRef((props, forwardedRef) => {
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const { forceMount, ...scrollbarProps } = props;
    const [visible, setVisible] = React2__namespace.useState(false);
    const isHorizontal = props.orientation === "horizontal";
    const handleResize = useDebounceCallback(() => {
      if (context.viewport) {
        const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth;
        const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight;
        setVisible(isHorizontal ? isOverflowX : isOverflowY);
      }
    }, 10);
    useResizeObserver(context.viewport, handleResize);
    useResizeObserver(context.content, handleResize);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaScrollbarVisible,
      {
        "data-state": visible ? "visible" : "hidden",
        ...scrollbarProps,
        ref: forwardedRef
      }
    ) });
  });
  var ScrollAreaScrollbarVisible = React2__namespace.forwardRef((props, forwardedRef) => {
    const { orientation = "vertical", ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const thumbRef = React2__namespace.useRef(null);
    const pointerOffsetRef = React2__namespace.useRef(0);
    const [sizes, setSizes] = React2__namespace.useState({
      content: 0,
      viewport: 0,
      scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
    });
    const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);
    const commonProps = {
      ...scrollbarProps,
      sizes,
      onSizesChange: setSizes,
      hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
      onThumbChange: (thumb) => thumbRef.current = thumb,
      onThumbPointerUp: () => pointerOffsetRef.current = 0,
      onThumbPointerDown: (pointerPos) => pointerOffsetRef.current = pointerPos
    };
    function getScrollPosition(pointerPos, dir) {
      return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir);
    }
    if (orientation === "horizontal") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScrollAreaScrollbarX,
        {
          ...commonProps,
          ref: forwardedRef,
          onThumbPositionChange: () => {
            if (context.viewport && thumbRef.current) {
              const scrollPos = context.viewport.scrollLeft;
              const offset = getThumbOffsetFromScroll(scrollPos, sizes, context.dir);
              thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
            }
          },
          onWheelScroll: (scrollPos) => {
            if (context.viewport) context.viewport.scrollLeft = scrollPos;
          },
          onDragScroll: (pointerPos) => {
            if (context.viewport) {
              context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
            }
          }
        }
      );
    }
    if (orientation === "vertical") {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScrollAreaScrollbarY,
        {
          ...commonProps,
          ref: forwardedRef,
          onThumbPositionChange: () => {
            if (context.viewport && thumbRef.current) {
              const scrollPos = context.viewport.scrollTop;
              const offset = getThumbOffsetFromScroll(scrollPos, sizes);
              thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
            }
          },
          onWheelScroll: (scrollPos) => {
            if (context.viewport) context.viewport.scrollTop = scrollPos;
          },
          onDragScroll: (pointerPos) => {
            if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos);
          }
        }
      );
    }
    return null;
  });
  var ScrollAreaScrollbarX = React2__namespace.forwardRef((props, forwardedRef) => {
    const { sizes, onSizesChange, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const [computedStyle, setComputedStyle] = React2__namespace.useState();
    const ref = React2__namespace.useRef(null);
    const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarXChange);
    React2__namespace.useEffect(() => {
      if (ref.current) setComputedStyle(getComputedStyle(ref.current));
    }, [ref]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaScrollbarImpl,
      {
        "data-orientation": "horizontal",
        ...scrollbarProps,
        ref: composeRefs,
        sizes,
        style: {
          bottom: 0,
          left: context.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
          right: context.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
          ["--radix-scroll-area-thumb-width"]: getThumbSize(sizes) + "px",
          ...props.style
        },
        onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.x),
        onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.x),
        onWheelScroll: (event, maxScrollPos) => {
          if (context.viewport) {
            const scrollPos = context.viewport.scrollLeft + event.deltaX;
            props.onWheelScroll(scrollPos);
            if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
              event.preventDefault();
            }
          }
        },
        onResize: () => {
          if (ref.current && context.viewport && computedStyle) {
            onSizesChange({
              content: context.viewport.scrollWidth,
              viewport: context.viewport.offsetWidth,
              scrollbar: {
                size: ref.current.clientWidth,
                paddingStart: toInt(computedStyle.paddingLeft),
                paddingEnd: toInt(computedStyle.paddingRight)
              }
            });
          }
        }
      }
    );
  });
  var ScrollAreaScrollbarY = React2__namespace.forwardRef((props, forwardedRef) => {
    const { sizes, onSizesChange, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const [computedStyle, setComputedStyle] = React2__namespace.useState();
    const ref = React2__namespace.useRef(null);
    const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarYChange);
    React2__namespace.useEffect(() => {
      if (ref.current) setComputedStyle(getComputedStyle(ref.current));
    }, [ref]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollAreaScrollbarImpl,
      {
        "data-orientation": "vertical",
        ...scrollbarProps,
        ref: composeRefs,
        sizes,
        style: {
          top: 0,
          right: context.dir === "ltr" ? 0 : void 0,
          left: context.dir === "rtl" ? 0 : void 0,
          bottom: "var(--radix-scroll-area-corner-height)",
          ["--radix-scroll-area-thumb-height"]: getThumbSize(sizes) + "px",
          ...props.style
        },
        onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.y),
        onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.y),
        onWheelScroll: (event, maxScrollPos) => {
          if (context.viewport) {
            const scrollPos = context.viewport.scrollTop + event.deltaY;
            props.onWheelScroll(scrollPos);
            if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
              event.preventDefault();
            }
          }
        },
        onResize: () => {
          if (ref.current && context.viewport && computedStyle) {
            onSizesChange({
              content: context.viewport.scrollHeight,
              viewport: context.viewport.offsetHeight,
              scrollbar: {
                size: ref.current.clientHeight,
                paddingStart: toInt(computedStyle.paddingTop),
                paddingEnd: toInt(computedStyle.paddingBottom)
              }
            });
          }
        }
      }
    );
  });
  var [ScrollbarProvider, useScrollbarContext] = createScrollAreaContext(SCROLLBAR_NAME);
  var ScrollAreaScrollbarImpl = React2__namespace.forwardRef((props, forwardedRef) => {
    const {
      __scopeScrollArea,
      sizes,
      hasThumb,
      onThumbChange,
      onThumbPointerUp,
      onThumbPointerDown,
      onThumbPositionChange,
      onDragScroll,
      onWheelScroll,
      onResize,
      ...scrollbarProps
    } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, __scopeScrollArea);
    const [scrollbar, setScrollbar] = React2__namespace.useState(null);
    const composeRefs = useComposedRefs(forwardedRef, (node) => setScrollbar(node));
    const rectRef = React2__namespace.useRef(null);
    const prevWebkitUserSelectRef = React2__namespace.useRef("");
    const viewport = context.viewport;
    const maxScrollPos = sizes.content - sizes.viewport;
    const handleWheelScroll = useCallbackRef(onWheelScroll);
    const handleThumbPositionChange = useCallbackRef(onThumbPositionChange);
    const handleResize = useDebounceCallback(onResize, 10);
    function handleDragScroll(event) {
      if (rectRef.current) {
        const x = event.clientX - rectRef.current.left;
        const y = event.clientY - rectRef.current.top;
        onDragScroll({ x, y });
      }
    }
    React2__namespace.useEffect(() => {
      const handleWheel = (event) => {
        const element = event.target;
        const isScrollbarWheel = scrollbar?.contains(element);
        if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
      };
      document.addEventListener("wheel", handleWheel, { passive: false });
      return () => document.removeEventListener("wheel", handleWheel, { passive: false });
    }, [viewport, scrollbar, maxScrollPos, handleWheelScroll]);
    React2__namespace.useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange]);
    useResizeObserver(scrollbar, handleResize);
    useResizeObserver(context.content, handleResize);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScrollbarProvider,
      {
        scope: __scopeScrollArea,
        scrollbar,
        hasThumb,
        onThumbChange: useCallbackRef(onThumbChange),
        onThumbPointerUp: useCallbackRef(onThumbPointerUp),
        onThumbPositionChange: handleThumbPositionChange,
        onThumbPointerDown: useCallbackRef(onThumbPointerDown),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            ...scrollbarProps,
            ref: composeRefs,
            style: { position: "absolute", ...scrollbarProps.style },
            onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
              const mainPointer = 0;
              if (event.button === mainPointer) {
                const element = event.target;
                element.setPointerCapture(event.pointerId);
                rectRef.current = scrollbar.getBoundingClientRect();
                prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
                document.body.style.webkitUserSelect = "none";
                if (context.viewport) context.viewport.style.scrollBehavior = "auto";
                handleDragScroll(event);
              }
            }),
            onPointerMove: composeEventHandlers(props.onPointerMove, handleDragScroll),
            onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
              const element = event.target;
              if (element.hasPointerCapture(event.pointerId)) {
                element.releasePointerCapture(event.pointerId);
              }
              document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
              if (context.viewport) context.viewport.style.scrollBehavior = "";
              rectRef.current = null;
            })
          }
        )
      }
    );
  });
  var THUMB_NAME = "ScrollAreaThumb";
  var ScrollAreaThumb = React2__namespace.forwardRef(
    (props, forwardedRef) => {
      const { forceMount, ...thumbProps } = props;
      const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || scrollbarContext.hasThumb, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumbImpl, { ref: forwardedRef, ...thumbProps }) });
    }
  );
  var ScrollAreaThumbImpl = React2__namespace.forwardRef(
    (props, forwardedRef) => {
      const { __scopeScrollArea, style, ...thumbProps } = props;
      const scrollAreaContext = useScrollAreaContext(THUMB_NAME, __scopeScrollArea);
      const scrollbarContext = useScrollbarContext(THUMB_NAME, __scopeScrollArea);
      const { onThumbPositionChange } = scrollbarContext;
      const composedRef = useComposedRefs(
        forwardedRef,
        (node) => scrollbarContext.onThumbChange(node)
      );
      const removeUnlinkedScrollListenerRef = React2__namespace.useRef(void 0);
      const debounceScrollEnd = useDebounceCallback(() => {
        if (removeUnlinkedScrollListenerRef.current) {
          removeUnlinkedScrollListenerRef.current();
          removeUnlinkedScrollListenerRef.current = void 0;
        }
      }, 100);
      React2__namespace.useEffect(() => {
        const viewport = scrollAreaContext.viewport;
        if (viewport) {
          const handleScroll = () => {
            debounceScrollEnd();
            if (!removeUnlinkedScrollListenerRef.current) {
              const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
              removeUnlinkedScrollListenerRef.current = listener;
              onThumbPositionChange();
            }
          };
          onThumbPositionChange();
          viewport.addEventListener("scroll", handleScroll);
          return () => viewport.removeEventListener("scroll", handleScroll);
        }
      }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-state": scrollbarContext.hasThumb ? "visible" : "hidden",
          ...thumbProps,
          ref: composedRef,
          style: {
            width: "var(--radix-scroll-area-thumb-width)",
            height: "var(--radix-scroll-area-thumb-height)",
            ...style
          },
          onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, (event) => {
            const thumb = event.target;
            const thumbRect = thumb.getBoundingClientRect();
            const x = event.clientX - thumbRect.left;
            const y = event.clientY - thumbRect.top;
            scrollbarContext.onThumbPointerDown({ x, y });
          }),
          onPointerUp: composeEventHandlers(props.onPointerUp, scrollbarContext.onThumbPointerUp)
        }
      );
    }
  );
  ScrollAreaThumb.displayName = THUMB_NAME;
  var CORNER_NAME = "ScrollAreaCorner";
  var ScrollAreaCorner = React2__namespace.forwardRef(
    (props, forwardedRef) => {
      const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
      const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY);
      const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
      return hasCorner ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaCornerImpl, { ...props, ref: forwardedRef }) : null;
    }
  );
  ScrollAreaCorner.displayName = CORNER_NAME;
  var ScrollAreaCornerImpl = React2__namespace.forwardRef((props, forwardedRef) => {
    const { __scopeScrollArea, ...cornerProps } = props;
    const context = useScrollAreaContext(CORNER_NAME, __scopeScrollArea);
    const [width, setWidth] = React2__namespace.useState(0);
    const [height, setHeight] = React2__namespace.useState(0);
    const hasSize = Boolean(width && height);
    useResizeObserver(context.scrollbarX, () => {
      const height2 = context.scrollbarX?.offsetHeight || 0;
      context.onCornerHeightChange(height2);
      setHeight(height2);
    });
    useResizeObserver(context.scrollbarY, () => {
      const width2 = context.scrollbarY?.offsetWidth || 0;
      context.onCornerWidthChange(width2);
      setWidth(width2);
    });
    return hasSize ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        ...cornerProps,
        ref: forwardedRef,
        style: {
          width,
          height,
          position: "absolute",
          right: context.dir === "ltr" ? 0 : void 0,
          left: context.dir === "rtl" ? 0 : void 0,
          bottom: 0,
          ...props.style
        }
      }
    ) : null;
  });
  function toInt(value) {
    return value ? parseInt(value, 10) : 0;
  }
  function getThumbRatio(viewportSize, contentSize) {
    const ratio = viewportSize / contentSize;
    return isNaN(ratio) ? 0 : ratio;
  }
  function getThumbSize(sizes) {
    const ratio = getThumbRatio(sizes.viewport, sizes.content);
    const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
    const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
    return Math.max(thumbSize, 18);
  }
  function getScrollPositionFromPointer(pointerPos, pointerOffset, sizes, dir = "ltr") {
    const thumbSizePx = getThumbSize(sizes);
    const thumbCenter = thumbSizePx / 2;
    const offset = pointerOffset || thumbCenter;
    const thumbOffsetFromEnd = thumbSizePx - offset;
    const minPointerPos = sizes.scrollbar.paddingStart + offset;
    const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
    const maxScrollPos = sizes.content - sizes.viewport;
    const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
    const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
    return interpolate(pointerPos);
  }
  function getThumbOffsetFromScroll(scrollPos, sizes, dir = "ltr") {
    const thumbSizePx = getThumbSize(sizes);
    const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
    const scrollbar = sizes.scrollbar.size - scrollbarPadding;
    const maxScrollPos = sizes.content - sizes.viewport;
    const maxThumbPos = scrollbar - thumbSizePx;
    const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
    const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange);
    const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
    return interpolate(scrollWithoutMomentum);
  }
  function linearScale(input, output) {
    return (value) => {
      if (input[0] === input[1] || output[0] === output[1]) return output[0];
      const ratio = (output[1] - output[0]) / (input[1] - input[0]);
      return output[0] + ratio * (value - input[0]);
    };
  }
  function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
    return scrollPos > 0 && scrollPos < maxScrollPos;
  }
  var addUnlinkedScrollListener = (node, handler = () => {
  }) => {
    let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
    let rAF = 0;
    (function loop() {
      const position = { left: node.scrollLeft, top: node.scrollTop };
      const isHorizontalScroll = prevPosition.left !== position.left;
      const isVerticalScroll = prevPosition.top !== position.top;
      if (isHorizontalScroll || isVerticalScroll) handler();
      prevPosition = position;
      rAF = window.requestAnimationFrame(loop);
    })();
    return () => window.cancelAnimationFrame(rAF);
  };
  function useDebounceCallback(callback, delay) {
    const handleCallback = useCallbackRef(callback);
    const debounceTimerRef = React2__namespace.useRef(0);
    React2__namespace.useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);
    return React2__namespace.useCallback(() => {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(handleCallback, delay);
    }, [handleCallback, delay]);
  }
  function useResizeObserver(element, onResize) {
    const handleResize = useCallbackRef(onResize);
    useLayoutEffect2(() => {
      let rAF = 0;
      if (element) {
        const resizeObserver = new ResizeObserver(() => {
          cancelAnimationFrame(rAF);
          rAF = window.requestAnimationFrame(handleResize);
        });
        resizeObserver.observe(element);
        return () => {
          window.cancelAnimationFrame(rAF);
          resizeObserver.unobserve(element);
        };
      }
    }, [element, handleResize]);
  }
  var Root = ScrollArea$1;
  var Viewport = ScrollAreaViewport;
  var Scrollbar = ScrollAreaScrollbar;
  var Thumb = ScrollAreaThumb;
  var Corner = ScrollAreaCorner;

  const ScrollArea = /*#__PURE__*/React2__namespace.forwardRef(({
    className,
    children,
    ...props
  }, ref) => /*#__PURE__*/React2__namespace.createElement(Root, _extends({
    ref: ref,
    className: cn("relative overflow-hidden", className)
  }, props), /*#__PURE__*/React2__namespace.createElement(Viewport, {
    className: "h-full w-full rounded-[inherit]"
  }, children), /*#__PURE__*/React2__namespace.createElement(Scrollbar, {
    orientation: "vertical",
    className: "w-2"
  }, /*#__PURE__*/React2__namespace.createElement(Thumb, {
    className: "bg-gray-400 rounded-full"
  })), /*#__PURE__*/React2__namespace.createElement(Corner, null)));
  ScrollArea.displayName = Root.displayName;

  function AppointmentPicker() {
    const today = new Date();
    const [date, setDate] = React2.useState(today);
    const [time, setTime] = React2.useState(null);
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
    return /*#__PURE__*/React2.createElement("div", {
      className: "rounded-lg border border-gray-200 p-4 bg-white"
    }, /*#__PURE__*/React2.createElement("div", {
      className: "flex flex-col sm:flex-row gap-4"
    }, /*#__PURE__*/React2.createElement(Calendar, {
      mode: "single",
      selected: date,
      onSelect: d => d && (setDate(d), setTime(null)),
      className: "bg-background p-2",
      disabled: [{
        before: today
      }]
    }), /*#__PURE__*/React2.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React2.createElement(ScrollArea, {
      className: "h-64 border-t sm:border-l border-gray-200"
    }, /*#__PURE__*/React2.createElement("div", {
      className: "p-4 space-y-3"
    }, /*#__PURE__*/React2.createElement("p", {
      className: "text-sm font-medium"
    }, dateFns.format(date, "EEEE, MMM d")), /*#__PURE__*/React2.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, timeSlots.map(({
      time: ts,
      available
    }) => /*#__PURE__*/React2.createElement(Button, {
      key: ts,
      variant: time === ts ? "default" : "outline",
      size: "sm",
      className: "w-full",
      onClick: () => available && setTime(ts),
      disabled: !available
    }, ts))))))), /*#__PURE__*/React2.createElement("p", {
      className: "mt-4 text-center text-sm text-gray-500"
    }, "Selected time: ", time || "none"));
  }

  return AppointmentPicker;

}));
