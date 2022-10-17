
export let WaitingWheel = 'waiting.gif';

const urlAttribute = 'src';

class JehonImgLoading extends HTMLElement {
	static get observedAttributes() {
		return [urlAttribute];
	}

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
	 * @returns {JehonImgLoading} for chaining
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
	 * @returns {JehonImgLoading} for chaining
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

class JehonImageLoading extends JehonImgLoading { }

customElements.define('jehon-img-loading', JehonImgLoading);
customElements.define('jehon-image-loading', JehonImageLoading);
