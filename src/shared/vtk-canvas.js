import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';

// use vtk-canvas as a custom web component to encapsulate the rendering logic and provide a canvas for rendering
class VtkCanvas extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height', 'aria-label'];
    }

    get vtkComponents() {
        return this._vtkComponents;
    }

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        this._container = document.createElement('div');
        this._container.className = 'container';
        shadow.append(this._container);

        // Create a renderer and set its background color.
        const renderer = vtkRenderer.newInstance();
        renderer.setBackground(0.1, 0.1, 0.15);

        // Create the rendering window.
        const renderWindow = vtkRenderWindow.newInstance();
        renderWindow.addRenderer(renderer);

        // Create the browser's WebGL rendering view.
        const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
        openGLRenderWindow.setContainer(this._container);

        renderWindow.addView(openGLRenderWindow);

        // Set up mouse interaction.
        const interactor = vtkRenderWindowInteractor.newInstance();
        interactor.setView(openGLRenderWindow);

        this._vtkComponents = {
            renderer,
            renderWindow,
            openGLRenderWindow,
            interactor,
        };

        this._handleResize = () => this.resize();
    }

    // Configure the rendering dimensions on resize events
    resize() {
        this._vtkComponents.openGLRenderWindow.setSize(
            this._container.clientWidth,
            this._container.clientHeight
        );
        this._vtkComponents.renderWindow.render();
    }

    connectedCallback() {
        for (const attribute of VtkCanvas.observedAttributes) {
            this._syncCanvasAttribute(attribute);
        }
        this._syncCanvasAttribute('width');
        this._syncCanvasAttribute('height');
        window.addEventListener('resize', this._handleResize);
        // Correct rendering dimensions when the component is first connected to the DOM
        this.resize();
        // enable interactor events on the canvas
        this._vtkComponents.interactor.bindEvents(this._container);
        if (!this._initialized) {
            this._vtkComponents.interactor.initialize();
            this._initialized = true;
        }
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._handleResize);
        this._vtkComponents.interactor.unbindEvents();
    }

    attributeChangedCallback(name) {
        this._syncCanvasAttribute(name);
    }

    get canvas() {
        return this.vtkComponents.openGLRenderWindow.getCanvas();
    }

    get width() {
        return this.canvas.width;
    }

    set width(value) {
        this.setAttribute('width', String(value));
    }

    get height() {
        return this.canvas.height;
    }

    set height(value) {
        this.setAttribute('height', String(value));
    }

    getContext(contextType, contextAttributes) {
        return this.canvas.getContext(contextType, contextAttributes);
    }

    // Synchronize the canvas attributes with the custom element's attributes
    _syncCanvasAttribute(name) {
        if (name === 'width' || name === 'height') {
            const width = Number(this.getAttribute('width')) || 640;
            const height = Number(this.getAttribute('height')) || 400;
            this._container.style.maxWidth = `${width}px`;
            this._container.style.aspectRatio = `${width} / ${height}`;
            return;
        }

        if (name === 'aria-label') {
            if (this.hasAttribute(name)) {
                this.canvas.setAttribute(name, this.getAttribute(name));
            } else {
                this.canvas.removeAttribute(name);
            }
            return;
        }
    }
}

if (!customElements.get('vtk-canvas')) {
    customElements.define('vtk-canvas', VtkCanvas);
}
