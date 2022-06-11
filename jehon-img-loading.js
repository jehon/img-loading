
export let WaitingWheel = '/waiting.gif';

class JehonImgLoading extends HTMLElement {
    static get observedAttributes() {
        return ['src']
    }

    /** @type {HTMLImageElement} */
    #visible

    /** @type {HTMLImageElement} */
    #preload

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                img {
                    width: 50px;
                    height: 50px;
                    background-color: green;
                    object-fit: contain;

                    width: 100%;
                    height: 100%
                }

                img#preload {
                    display: none;
                }
            </style>
            
            <img id='visible'>
            <img id='preload'>
        `;

        this.#visible = this.shadowRoot.querySelector('#visible');
        this.#preload = this.shadowRoot.querySelector('#preload');
        this.#preload.addEventListener('load', () => {
            this.#visible.setAttribute('src', this.#preload.getAttribute('src'));
            // TODO: set custom event !
        })
    }

    attributeChangedCallback(attributeName, _oldValue, newValue) {
        switch (attributeName) {
            case 'src':
                this.#visible.setAttribute('src', WaitingWheel);
                this.#preload.setAttribute('src', newValue);
                break;
        }
    }

    loadImageWhileWaiting(url) {
        this.#visible.setAttribute('url', WaitingWheel);
        this.#preload.setAttribute('url', url);
    }

    loadAndDisplayImage(url) {
        this.#preload.setAttribute('url', url);
    }
}

customElements.define('jehon-img-loading', JehonImgLoading);
