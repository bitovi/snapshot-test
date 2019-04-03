import _CanvasRenderer from 'html2canvas/dist/npm/renderer/CanvasRenderer';
import _Logger from 'html2canvas/dist/npm/Logger';
import _Window from 'html2canvas/dist/npm/Window';
import {renderElement} from 'html2canvas/dist/npm/Window';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function getFunction(fn){
	return typeof fn === "function" ?  fn : fn.default;
}

var CanvasRenderer = getFunction(_CanvasRenderer);
var Logger = getFunction(_Logger);

var render = _Window ? _Window.renderElement : renderElement;

var html2canvas = function html2canvas(element, conf) {
    var config = conf || {};
    var logger = new Logger(typeof config.logging === 'boolean' ? config.logging : true);
    logger.log('html2canvas ' + "$npm_package_version");

    if (process.env.NODE_ENV !== 'production' && typeof config.onrendered === 'function') {
        logger.error('onrendered option is deprecated, html2canvas returns a Promise with the canvas as the value');
    }

    var ownerDocument = element.ownerDocument;
    if (!ownerDocument) {
        return Promise.reject('Provided element is not within a Document');
    }
    var defaultView = ownerDocument.defaultView;

    var defaultOptions = {
        async: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        logging: true,
        proxy: null,
        removeContainer: true,
        foreignObjectRendering: false,
        scale: 1,
        target: new CanvasRenderer(config.canvas),
        useCORS: false,
        windowWidth: defaultView.innerWidth,
        windowHeight: defaultView.innerHeight,
        scrollX: defaultView.pageXOffset,
        scrollY: defaultView.pageYOffset
    };


    var result = render(element, _extends({}, defaultOptions, config), logger);

    if (process.env.NODE_ENV !== 'production') {
        return result.catch(function (e) {
            logger.error(e);
            throw e;
        });
    }
    return result;
};

export default html2canvas;
