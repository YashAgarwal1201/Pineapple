import{r as i,I as U,C as ne,P as re,O as b,a as ae,m as y,f as le,U as oe,g as ie,h as ue,R as se}from"./index-2e94f979.js";function T(){return T=Object.assign?Object.assign.bind():function(r){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=e[t])}return r},T.apply(this,arguments)}var V=i.memo(i.forwardRef(function(r,n){var e=U.getPTI(r);return i.createElement("svg",T({ref:n,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg"},e),i.createElement("path",{d:"M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",fill:"currentColor"}))}));V.displayName="MinusIcon";function w(){return w=Object.assign?Object.assign.bind():function(r){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=e[t])}return r},w.apply(this,arguments)}function ce(r){if(Array.isArray(r))return r}function fe(r,n){var e=r==null?null:typeof Symbol<"u"&&r[Symbol.iterator]||r["@@iterator"];if(e!=null){var t,a,l,o,u=[],s=!0,f=!1;try{if(l=(e=e.call(r)).next,n===0){if(Object(e)!==e)return;s=!1}else for(;!(s=(t=l.call(e)).done)&&(u.push(t.value),u.length!==n);s=!0);}catch(v){f=!0,a=v}finally{try{if(!s&&e.return!=null&&(o=e.return(),Object(o)!==o))return}finally{if(f)throw a}}return u}}function R(r,n){(n==null||n>r.length)&&(n=r.length);for(var e=0,t=new Array(n);e<n;e++)t[e]=r[e];return t}function pe(r,n){if(r){if(typeof r=="string")return R(r,n);var e=Object.prototype.toString.call(r).slice(8,-1);if(e==="Object"&&r.constructor&&(e=r.constructor.name),e==="Map"||e==="Set")return Array.from(r);if(e==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return R(r,n)}}function ge(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function me(r,n){return ce(r)||fe(r,n)||pe(r,n)||ge()}function p(r){"@babel/helpers - typeof";return p=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},p(r)}function de(r,n){if(!(r instanceof n))throw new TypeError("Cannot call a class as a function")}function ye(r,n){if(p(r)!=="object"||r===null)return r;var e=r[Symbol.toPrimitive];if(e!==void 0){var t=e.call(r,n||"default");if(p(t)!=="object")return t;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(r)}function ve(r){var n=ye(r,"string");return p(n)==="symbol"?n:String(n)}function $(r,n){for(var e=0;e<n.length;e++){var t=n[e];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(r,ve(t.key),t)}}function he(r,n,e){return n&&$(r.prototype,n),e&&$(r,e),Object.defineProperty(r,"prototype",{writable:!1}),r}var Ee=function(){function r(){de(this,r)}return he(r,null,[{key:"equals",value:function(e,t,a){return a&&e&&p(e)==="object"&&t&&p(t)==="object"?this.resolveFieldData(e,a)===this.resolveFieldData(t,a):this.deepEquals(e,t)}},{key:"deepEquals",value:function(e,t){if(e===t)return!0;if(e&&t&&p(e)=="object"&&p(t)=="object"){var a=Array.isArray(e),l=Array.isArray(t),o,u,s;if(a&&l){if(u=e.length,u!==t.length)return!1;for(o=u;o--!==0;)if(!this.deepEquals(e[o],t[o]))return!1;return!0}if(a!==l)return!1;var f=e instanceof Date,v=t instanceof Date;if(f!==v)return!1;if(f&&v)return e.getTime()===t.getTime();var P=e instanceof RegExp,E=t instanceof RegExp;if(P!==E)return!1;if(P&&E)return e.toString()===t.toString();var C=Object.keys(e);if(u=C.length,u!==Object.keys(t).length)return!1;for(o=u;o--!==0;)if(!Object.prototype.hasOwnProperty.call(t,C[o]))return!1;for(o=u;o--!==0;)if(s=C[o],!this.deepEquals(e[s],t[s]))return!1;return!0}return e!==e&&t!==t}},{key:"resolveFieldData",value:function(e,t){if(e&&Object.keys(e).length&&t){if(this.isFunction(t))return t(e);if(r.isNotEmpty(e[t]))return e[t];if(t.indexOf(".")===-1)return e[t];for(var a=t.split("."),l=e,o=0,u=a.length;o<u;++o){if(l==null)return null;l=l[a[o]]}return l}else return null}},{key:"isFunction",value:function(e){return!!(e&&e.constructor&&e.call&&e.apply)}},{key:"isObject",value:function(e){return e!==null&&e instanceof Object&&e.constructor===Object}},{key:"isLetter",value:function(e){return e&&(e.toUpperCase()!=e.toLowerCase()||e.codePointAt(0)>127)}},{key:"findDiffKeys",value:function(e,t){return!e||!t?{}:Object.keys(e).filter(function(a){return!t.hasOwnProperty(a)}).reduce(function(a,l){return a[l]=e[l],a},{})}},{key:"reduceKeys",value:function(e,t){var a={};return!e||!t||t.length===0||Object.keys(e).filter(function(l){return t.some(function(o){return l.startsWith(o)})}).forEach(function(l){a[l]=e[l],delete e[l]}),a}},{key:"reorderArray",value:function(e,t,a){e&&t!==a&&(a>=e.length&&(a%=e.length,t%=e.length),e.splice(a,0,e.splice(t,1)[0]))}},{key:"findIndexInList",value:function(e,t,a){var l=this;return t?a?t.findIndex(function(o){return l.equals(o,e,a)}):t.findIndex(function(o){return o===e}):-1}},{key:"getJSXElement",value:function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),l=1;l<t;l++)a[l-1]=arguments[l];return this.isFunction(e)?e.apply(void 0,a):e}},{key:"getProp",value:function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"",a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},l=e?e[t]:void 0;return l===void 0?a[t]:l}},{key:"getMergedProps",value:function(e,t){return Object.assign({},t,e)}},{key:"getDiffProps",value:function(e,t){return this.findDiffKeys(e,t)}},{key:"getPropValue",value:function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),l=1;l<t;l++)a[l-1]=arguments[l];return this.isFunction(e)?e.apply(void 0,a):e}},{key:"getComponentProp",value:function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:"",a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};return this.isNotEmpty(e)?this.getProp(e.props,t,a):void 0}},{key:"getComponentProps",value:function(e,t){return this.isNotEmpty(e)?this.getMergedProps(e.props,t):void 0}},{key:"getComponentDiffProps",value:function(e,t){return this.isNotEmpty(e)?this.getDiffProps(e.props,t):void 0}},{key:"isValidChild",value:function(e,t,a){if(e){var l=this.getComponentProp(e,"__TYPE")||(e.type?e.type.displayName:void 0),o=l===t;try{var u}catch{}return o}return!1}},{key:"getRefElement",value:function(e){return e?p(e)==="object"&&e.hasOwnProperty("current")?e.current:e:null}},{key:"combinedRefs",value:function(e,t){e&&t&&(typeof t=="function"?t(e.current):t.current=e.current)}},{key:"removeAccents",value:function(e){return e&&e.search(/[\xC0-\xFF]/g)>-1&&(e=e.replace(/[\xC0-\xC5]/g,"A").replace(/[\xC6]/g,"AE").replace(/[\xC7]/g,"C").replace(/[\xC8-\xCB]/g,"E").replace(/[\xCC-\xCF]/g,"I").replace(/[\xD0]/g,"D").replace(/[\xD1]/g,"N").replace(/[\xD2-\xD6\xD8]/g,"O").replace(/[\xD9-\xDC]/g,"U").replace(/[\xDD]/g,"Y").replace(/[\xDE]/g,"P").replace(/[\xE0-\xE5]/g,"a").replace(/[\xE6]/g,"ae").replace(/[\xE7]/g,"c").replace(/[\xE8-\xEB]/g,"e").replace(/[\xEC-\xEF]/g,"i").replace(/[\xF1]/g,"n").replace(/[\xF2-\xF6\xF8]/g,"o").replace(/[\xF9-\xFC]/g,"u").replace(/[\xFE]/g,"p").replace(/[\xFD\xFF]/g,"y")),e}},{key:"convertToFlatCase",value:function(e){return this.isNotEmpty(e)&&typeof e=="string"?e.replace(/(-|_)/g,"").toLowerCase():e}},{key:"isEmpty",value:function(e){return e==null||e===""||Array.isArray(e)&&e.length===0||!(e instanceof Date)&&p(e)==="object"&&Object.keys(e).length===0}},{key:"isNotEmpty",value:function(e){return!this.isEmpty(e)}},{key:"sort",value:function(e,t){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:1,l=arguments.length>3?arguments[3]:void 0,o=arguments.length>4&&arguments[4]!==void 0?arguments[4]:1,u=r.compare(e,t,l,a),s=a;return(r.isEmpty(e)||r.isEmpty(t))&&(s=o===1?a:o),s*u}},{key:"compare",value:function(e,t,a){var l=arguments.length>3&&arguments[3]!==void 0?arguments[3]:1,o=-1,u=r.isEmpty(e),s=r.isEmpty(t);return u&&s?o=0:u?o=l:s?o=-l:typeof e=="string"&&typeof t=="string"?o=e.localeCompare(t,a,{numeric:!0}):o=e<t?-1:e>t?1:0,o}}]),r}(),j=0;function Ce(){var r=arguments.length>0&&arguments[0]!==void 0?arguments[0]:"pr_id_";return j++,"".concat(r).concat(j)}var q=i.memo(i.forwardRef(function(r,n){var e=U.getPTI(r),t=i.useState(r.id),a=me(t,2),l=a[0],o=a[1];return i.useEffect(function(){Ee.isEmpty(l)&&o(Ce("pr_icon_clip_"))},[l]),i.createElement("svg",w({ref:n,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg"},e),i.createElement("g",{clipPath:"url(#".concat(l,")")},i.createElement("path",{d:"M7.67742 6.32258V0.677419C7.67742 0.497757 7.60605 0.325452 7.47901 0.198411C7.35197 0.0713707 7.17966 0 7 0C6.82034 0 6.64803 0.0713707 6.52099 0.198411C6.39395 0.325452 6.32258 0.497757 6.32258 0.677419V6.32258H0.677419C0.497757 6.32258 0.325452 6.39395 0.198411 6.52099C0.0713707 6.64803 0 6.82034 0 7C0 7.17966 0.0713707 7.35197 0.198411 7.47901C0.325452 7.60605 0.497757 7.67742 0.677419 7.67742H6.32258V13.3226C6.32492 13.5015 6.39704 13.6725 6.52358 13.799C6.65012 13.9255 6.82106 13.9977 7 14C7.17966 14 7.35197 13.9286 7.47901 13.8016C7.60605 13.6745 7.67742 13.5022 7.67742 13.3226V7.67742H13.3226C13.5022 7.67742 13.6745 7.60605 13.8016 7.47901C13.9286 7.35197 14 7.17966 14 7C13.9977 6.82106 13.9255 6.65012 13.799 6.52358C13.6725 6.39704 13.5015 6.32492 13.3226 6.32258H7.67742Z",fill:"currentColor"})),i.createElement("defs",null,i.createElement("clipPath",{id:l},i.createElement("rect",{width:"14",height:"14",fill:"white"}))))}));q.displayName="PlusIcon";function xe(r){if(Array.isArray(r))return r}function be(r,n){var e=r==null?null:typeof Symbol<"u"&&r[Symbol.iterator]||r["@@iterator"];if(e!=null){var t,a,l,o,u=[],s=!0,f=!1;try{if(l=(e=e.call(r)).next,n===0){if(Object(e)!==e)return;s=!1}else for(;!(s=(t=l.call(e)).done)&&(u.push(t.value),u.length!==n);s=!0);}catch(v){f=!0,a=v}finally{try{if(!s&&e.return!=null&&(o=e.return(),Object(o)!==o))return}finally{if(f)throw a}}return u}}function M(r,n){(n==null||n>r.length)&&(n=r.length);for(var e=0,t=new Array(n);e<n;e++)t[e]=r[e];return t}function Pe(r,n){if(r){if(typeof r=="string")return M(r,n);var e=Object.prototype.toString.call(r).slice(8,-1);if(e==="Object"&&r.constructor&&(e=r.constructor.name),e==="Map"||e==="Set")return Array.from(r);if(e==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return M(r,n)}}function Oe(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function H(r,n){return xe(r)||be(r,n)||Pe(r,n)||Oe()}var I=ne.extend({defaultProps:{__TYPE:"Panel",id:null,header:null,headerTemplate:null,footer:null,footerTemplate:null,toggleable:null,style:null,className:null,collapsed:null,expandIcon:null,collapseIcon:null,icons:null,transitionOptions:null,onExpand:null,onCollapse:null,onToggle:null,children:void 0}}),Se=i.forwardRef(function(r,n){var e=i.useContext(re),t=I.getProps(r,e),a=i.useState(t.id),l=H(a,2),o=l[0],u=l[1],s=i.useState(t.collapsed),f=H(s,2),v=f[0],P=f[1],E=i.useRef(n),C=i.useRef(null),g=t.toggleable?t.onToggle?t.collapsed:v:!1,A=o+"_header",D=o+"_content",J=I.setMetaData({props:t,state:{id:o,collapsed:g}}),m=J.ptm,N=function(c){t.toggleable&&(g?L(c):X(c),t.onToggle&&t.onToggle({originalEvent:c,value:!g})),c.preventDefault()},L=function(c){t.onToggle||P(!1),t.onExpand&&t.onExpand(c)},X=function(c){t.onToggle||P(!0),t.onCollapse&&t.onCollapse(c)};i.useImperativeHandle(n,function(){return{props:t,getElement:function(){return E.current},getContent:function(){return C.current}}}),i.useEffect(function(){b.combinedRefs(E,n)},[E,n]),ae(function(){o||u(oe())});var _=function(){if(t.toggleable){var c=o+"_label",x=y({className:"p-panel-header-icon p-panel-toggler p-link",onClick:N,id:c,"aria-controls":D,"aria-expanded":!g,role:"tab"},m("toggler")),d=y(m("togglericon")),O=g?t.expandIcon||i.createElement(q,d):t.collapseIcon||i.createElement(V,d),S=ue.getJSXIcon(O,d,{props:t,collapsed:g});return i.createElement("button",x,S,i.createElement(se,null))}return null},B=function(){var c=b.getJSXElement(t.header,t),x=b.getJSXElement(t.icons,t),d=_(),O=y({id:A,className:"p-panel-title"},m("title")),S=i.createElement("span",O,c),Q=y({className:"p-panel-icons"},m("icons")),F=i.createElement("div",Q,x,d),ee=y({className:"p-panel-header"},m("header")),k=i.createElement("div",ee,S,F);if(t.headerTemplate){var te={className:"p-panel-header",titleClassName:"p-panel-title",iconsClassName:"p-panel-icons",togglerClassName:"p-panel-header-icon p-panel-toggler p-link",onTogglerClick:N,titleElement:S,iconsElement:F,togglerElement:d,element:k,props:t,collapsed:g};return b.getJSXElement(t.headerTemplate,te)}else if(t.header||t.toggleable)return k;return null},K=function(){var c=y({ref:C,className:"p-toggleable-content","aria-hidden":g,role:"region",id:D,"aria-labelledby":A},m("toggleablecontent")),x=y({className:"p-panel-content"},m("content"));return i.createElement(ie,{nodeRef:C,classNames:"p-toggleable-content",timeout:{enter:1e3,exit:450},in:!g,unmountOnExit:!0,options:t.transitionOptions},i.createElement("div",c,i.createElement("div",x,t.children)))},Y=function(){var c=b.getJSXElement(t.footer,t),x=y({className:"p-panel-footer"},m("footer")),d=i.createElement("div",x,c);if(t.footerTemplate){var O={className:"p-panel-footer",element:d,props:t};return b.getJSXElement(t.footerTemplate,O)}else if(t.footer)return d;return null},Z=y({id:o,ref:E,style:t.style,className:le("p-panel p-component",{"p-panel-toggleable":t.toggleable},t.className)},I.getOtherProps(t),m("root")),W=B(),z=K(),G=Y();return i.createElement("div",Z,W,z,G)});Se.displayName="Panel";export{Se as P};
