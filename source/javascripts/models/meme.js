/*
* MemeModel
* Manages rendering parameters and background image data.
*/
MEME.MemeModel = Backbone.Model.extend({
  defaults: {
    aspectRatio: 'us-letter',
    /* backgroundColor: '',
    backgroundColorOpts: ['#ffffff', '#17292e', '#0f81e8', '#40d7d4', '#FFAB03'], */
    backgroundPosition: { x: null, y: null },
    creditText: 'Source:',
    creditSize: 12,
    downloadName: 'share',
    fontColor: 'white',
    fontColorOpts: ['#ffffff', '#17292e', '#0f81e8', '#40d7d4', '#FFAB03'],
    fontFamily: 'katwijk-mono-web',
    fontFamilyOpts: [
      {text:'Klima', value:'klima-web'},
      {text:'Greve', value:'greve-web'},
      {text:'Katwijk Mono', value:'katwijk-mono-web'}
    ],
    fontSize: 26,
    headlineText: 'Write your own headline',
    dateTimeText: 'Monday, January 1 2020 – 8pm',
    websiteUrlText: 'myeventurl.org',
    height: 1060,
    imageScale: 1,
    imageOpts: '',
    overlayAlpha: 0.5,
    overlayColor: '#17292e',
    overlayColorOpts: ['#ffffff', '#17292e', '#0f81e8', '#40d7d4', '#FFAB03'],
    paddingRatio: 0.07,
    textAlign: 'center',
    textAlignOpts: [
      {text: 'Left-aligned', value: 'left'},
      {text: 'Center-aligned', value: 'center'},
      {text: 'Right-aligned', value: 'right'}
    ],
    /*textShadow: false,
    textShadowEdit: true, */
    width: 824
  },

  // Initialize with custom image member used for the background.
  // This image will (sort of) behave like a managed model field.
  initialize: function() {
    /**
     * // TO DO
     * Refactor above to follow the following convention
     * @function handleChange
     * @param {String} 'change'
     * @param cb callback that handles the change detected in the Backbone extend
     */
    this._imagesByAspectRatioName = {};
    _.each(this.get('aspectRatioOpts'), function (aspectRatioOpt) {
      var image = new Image();
      image.onload = _.bind(this.trigger, this, 'imageLoaded');
      image.src = aspectRatioOpt.backgroundImageSrc;

      this._imagesByAspectRatioName[aspectRatioOpt.value] = image;
    }, this);
  },

  getBackgroundImage: function () {
    return this._imagesByAspectRatioName[this.get('aspectRatio')];
  },

  // Specifies if the background image currently has data:
  hasBackground: function() {
    var backgroundImage = this.getBackgroundImage();
    return Boolean(backgroundImage.width && backgroundImage.height);
  },
});
