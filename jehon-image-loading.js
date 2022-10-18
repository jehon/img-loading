
const root = import.meta.url.match(/.*\//);
let WaitingWheel = root + '/waiting.png';

const urlAttribute = 'src';

export default class JehonImageLoading extends HTMLElement {
	static setWaitingWheelUrl(url) {
		WaitingWheel = url;
	}

	static get observedAttributes() {
		return [urlAttribute];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
            <style>
				:host(*) {
					display: block;
					width: 100%;
					height: 100%;
				}

                img {

                    width: 100%;
                    height: 100%;

                    background-color: green;
                    object-fit: contain;
                }

                img[state=loading] {
                    display: none;
                }

            </style>
            <img src='${WaitingWheel}'>
			<slot></slot>
        `;
	}

	attributeChangedCallback(attributeName, oldValue, newValue) {
		switch (attributeName) {
			case urlAttribute:
				if (newValue != oldValue) {
					this.loadAndDisplayImage(newValue);
				}
				break;
		}
	}

	/**
	 * Show a waiting wheel while the url-image is loading
	 *
	 * @param {string} url of the image to be loaded
	 * @returns {JehonImageLoading} for chaining
	 */
	loadImageWhileWaiting(url) {
		this.loadAndDisplayImage(WaitingWheel, true);
		this.loadAndDisplayImage(url, false);
		return this;
	}

	/**
	 * Stay on current image while the url-image is loading
	 *
	 * @param {string} url of the image to be loaded
	 * @param {boolean?} whenReady if the image need to be displayed directly
	 * @returns {JehonImageLoading} for chaining
	 */
	loadAndDisplayImage(url, whenReady = true) {
		const el = document.createElement('img');
		el.setAttribute('src', url);
		el.setAttribute('state', 'loading');

		el.addEventListener('load', () => {
			el.setAttribute('state', 'loaded');
			this.shadowRoot.querySelectorAll('img:not([loading])')
				.forEach(img => img.remove());
			this.shadowRoot.appendChild(el);
			this.dispatchEvent(new CustomEvent('load', { detail: url }));
		});

		if (!whenReady) {
			// Simulate that we are ready
			el.dispatchEvent(new Event('load'));
		}
		return this;
	}
}

if (customElements.get('jehon-image-loading')) {
	console.warn('Component jehon-image-loading was already defined');
} else {
	customElements.define('jehon-image-loading', JehonImageLoading);
}
