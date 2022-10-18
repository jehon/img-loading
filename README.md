# img-loading

Ever wanted to have a waiting wheel while your image is loading?

Ever wanted to show a new image only when it is ready?

Juste act like this:

```html
    <jehon-img-loading src='your-image.jpg'></jehon-img-loading>
```

## How does it works?

At first, the element is initialized with a loading gif.

When the url change, the element will:
- Load the new image in the background
- When the new image is loaded, it will put it front and remove the old one (the old one being the waiting wheel for the first load).

## API 

The element has various API:

```js
    el = document.querySelector('jehon-image-loading...');

    /**
     * Show a waiting wheel while the url-image is loading
     */
    el.loadImageWhileWaiting(url)

    /**
     * Stay on current image while the url-image is loading
     */
    el.loadAndDisplayImage(url)
```

## Events

### load

Event fired when the new url-image is loaded and has been displayed.

In the detail, you will find the url of the loaded image.

## Credits

Waiting wheel: 
https://commons.wikimedia.org/wiki/File:Loading_icon.gif
https://commons.wikimedia.org/wiki/File:Hourglass_icon.png

Landscape:
Kerry Raymond - https://commons.wikimedia.org/wiki/File:Landscape_of_Tarome,_2022_08.jpg
Kerry Raymond - retrieved at https://commons.wikimedia.org/wiki/File:Landscape_of_Tarome,_2022_12.jpg

