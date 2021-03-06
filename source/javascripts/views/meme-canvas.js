/*
* MemeCanvasView
* Manages the creation, rendering, and download of the Meme image.
*/
MEME.MemeCanvasView = Backbone.View.extend({

  initialize: function() {
    var canvas = document.createElement('canvas');
    var $container = MEME.$('#meme-canvas');

    // Display canvas, if enabled:
    if (canvas && canvas.getContext) {
      $container.html(canvas);
      this.canvas = canvas;
      this.setDownload();
      this.render();
    } else {
      $container.html(this.$('noscript').html());
    }

    // Listen to model for changes, and re-render in response:
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'imageLoaded', this.render);
  },

  setDownload: function() {
    var a = document.createElement('a');
    if (typeof a.download == 'undefined') {
      this.$el.append('<p class="m-canvas__download-note">Right-click button and select "Download Linked File..." to save image.</p>');
    }
  },

  render: function() {
    // Return early if there is no valid canvas to render:
    if (!this.canvas) return;

    // Collect model data:
    var m = this.model;
    var d = this.model.toJSON();
    var ctx = this.canvas.getContext('2d');
    var padding = Math.round(d.width * d.paddingRatio);

    switch (d.aspectRatio) {
      case "us-letter":
        d.width = 824, d.height = 1060;
        padding = Math.round(d.width * d.paddingRatio);
        break;
      case "us-tabloid":
        d.width = 1060, d.height = 1620;
        padding = Math.round(d.width * d.paddingRatio);
        d.eventInfoFontSize = 26;
        d.eventDescriptionFontSize = 17;
        break;
      case "a4":
        d.width = 820, d.height = 1100;
        padding = Math.round(d.width * d.paddingRatio);
        break;
      case "a3":
        d.width = 1100, d.height = 1580;
        padding = Math.round(d.width * d.paddingRatio);
        d.eventInfoFontSize = 25;
        d.eventDescriptionFontSize = 17;
    }

    // Reset canvas display:
    this.canvas.width = d.width;
    this.canvas.height = d.height;
    ctx.clearRect(0, 0, d.width, d.height);

    function renderBackground(ctx) {
      if (!m.hasBackground()) {
        return;
      }

      var backgroundImage = m.getBackgroundImage();

      // Base height and width:
      var bh = backgroundImage.height;
      var bw = backgroundImage.width;

      /* user-scalable image
      if (bh && bw) {
        // Transformed height and width:
        // Set the base position if null
        var th = bh * d.imageScale;
        var tw = bw * d.imageScale;
        var cx = d.backgroundPosition.x || d.width / 2;
        var cy = d.backgroundPosition.y || d.height / 2;

        ctx.drawImage(m.background, 0, 0, bw, bh, cx-(tw/2), cy-(th/2), tw, th);
      }
      */
      // Constrain transformed height based on maximum allowed width:
      if (bh && bw) {
        // Calculate maximum width:
        var mw = d.width;

        // Constrain transformed height based on maximum allowed width:
        if (mw < bw) {
          th = bh * (mw / bw);
          tw = mw;
        }
        ctx.globalAlpha = d.imageOpacity;
        ctx.drawImage(backgroundImage, 0, 0, bw, bh, (d.width-tw)/2, (d.height-th)/2, tw, th);
      }
    }

    function renderBackgroundColor(ctx) {
      if (d.backgroundColor) {
        ctx.save();
        ctx.fillStyle = d.backgroundColor;
        ctx.fillRect(0, 0, d.width, d.height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    function renderOverlay(ctx) {
      if (d.overlayColor) {
        ctx.save();
        ctx.globalAlpha = d.overlayAlpha;
        ctx.fillStyle = d.overlayColor;
        ctx.fillRect(0, 0, d.width, d.height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }

    var headlineTextBoxHeight = d.fontSize;

    function renderHeadlineText(ctx) {
      var maxWidth = Math.round(d.width * 0.75);
      var x = padding;
      var y = padding + 30;

      ctx.font = d.fontSize +'pt '+ d.fontFamilyHeadline;
      ctx.fillStyle = d.fontColor;
      ctx.textBaseline = 'top';

      // Text alignment:
      if (d.textAlign == 'center') {
        ctx.textAlign = 'center';
        x = d.width / 2;

      } else if (d.textAlign == 'right' ) {
        ctx.textAlign = 'right';
        x = d.width - padding;

      } else {
        ctx.textAlign = 'left';
      }

      var words = d.headlineText.toUpperCase().split(' ');
      var line  = '';
      var numberOfLines = 1;

      for (var n = 0; n < words.length; n++) {
        var testLine  = line + words[n] + ' ';
        var metrics   = ctx.measureText( testLine );
        var testWidth = metrics.width;
        if ( (testWidth > maxWidth && n > 0) ) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += Math.round(d.fontSize * 1.1);
          numberOfLines++;
        } else {
          line = testLine;
        }
        // crude calculation for the height of a multiline text headlineTextBoxHeight
        // replace with metrics.actualBoundingBoxAscent once browser support is good enough
        headlineTextBoxHeight = Math.round(d.fontSize * 1.1 * numberOfLines + 60);
      }
      ctx.fillText(line, x, y);
      ctx.shadowColor = 'transparent';
    }

    function renderDateTimeText(ctx) {
      var maxWidth = Math.round(d.width * 0.75);
      var x = padding;
      var y = padding + headlineTextBoxHeight + 50;

      ctx.font = 'bold ' + d.eventInfoFontSize +'pt ' + d.fontFamilyBody;
      ctx.fillStyle = d.fontColor;
      ctx.textBaseline = 'top';

      // Text alignment:
      if (d.textAlign == 'center') {
        ctx.textAlign = 'center';
        x = d.width / 2;
      } else if (d.textAlign == 'right' ) {
        ctx.textAlign = 'right';
        x = d.width - padding;
      } else {
        ctx.textAlign = 'left';
      }

      ctx.fillText(d.dateTimeText, x, y);
      ctx.shadowColor = 'transparent';
    }

    function renderLocationText(ctx) {
      var maxWidth = Math.round(d.width * 0.75);
      var x = padding;
      var y = padding + headlineTextBoxHeight + 50 + d.eventInfoFontSize*2;

      ctx.font =  d.eventInfoFontSize +'pt ' + d.fontFamilyBody;
      ctx.fillStyle = d.fontColor;
      ctx.textBaseline = 'top';

      // Text alignment:
      if (d.textAlign == 'center') {
        ctx.textAlign = 'center';
        x = d.width / 2;
      } else if (d.textAlign == 'right' ) {
        ctx.textAlign = 'right';
        x = d.width - padding;
      } else {
        ctx.textAlign = 'left';
      }

      ctx.fillText(d.locationText, x, y);
      ctx.shadowColor = 'transparent';
    }

    function renderDescriptionText(ctx) {
      var maxWidth = Math.round(d.width * 0.75);
      var x = padding;
      var y = padding + headlineTextBoxHeight + 50 + d.eventInfoFontSize*4 + 30;

      ctx.font = d.eventDescriptionFontSize +'pt ' + d.fontFamilyBody;
      ctx.fillStyle = d.fontColor;
      ctx.textBaseline = 'top';

      // Text alignment:
      if (d.textAlign == 'center') {
        ctx.textAlign = 'center';
        x = d.width / 2;
      } else if (d.textAlign == 'right' ) {
        ctx.textAlign = 'right';
        x = d.width - padding;
      } else {
        ctx.textAlign = 'left';
      }

      var words = d.locationTwoText.split(' ');
      var line  = '';
      var numberOfLines = 1;

      for (var n = 0; n < words.length; n++) {
        var testLine  = line + words[n] + ' ';
        var metrics   = ctx.measureText( testLine );
        var testWidth = metrics.width;
        if ( (testWidth > maxWidth && n > 0) ) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += Math.round(d.eventDescriptionFontSize * 2.15);
          numberOfLines++;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
    }


    function renderWebsiteUrlText(ctx) {
      var maxWidth = Math.round(d.width * 0.75);
      var x = padding;
      var y = d.height - padding - 15;

      ctx.font =  d.eventWebsiteFontSize +'pt ' + d.fontFamilySecondary;
      ctx.fillStyle = d.fontColor;
      ctx.textBaseline = 'baseline';

      // Text alignment:
      if (d.textAlign == 'center') {
        ctx.textAlign = 'center';
        x = d.width / 2;
      } else if (d.textAlign == 'right' ) {
        ctx.textAlign = 'right';
        x = d.width - padding;
      } else {
        ctx.textAlign = 'left';
      }

      var words = d.websiteUrlText.split(" ");
      var line  = '';

      for (var n = 0; n < words.length; n++) {
        var testLine  = line + words[n] + ' ';
        var metrics   = ctx.measureText( testLine );
        var testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += Math.round(d.fontSize * 1.9);
        } else {
          line = testLine;
        }
      }

      ctx.fillText(line, x, y);
      ctx.shadowColor = 'transparent';
    }

    function renderCredit(ctx) {
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'left';
      ctx.fillStyle = d.fontColor;
      ctx.font = 'normal '+ d.creditSize +'pt '+ d.fontFamilySecondary;
      ctx.fillText(d.creditText, padding, d.height - padding);
    }

    renderBackground(ctx);
    renderOverlay(ctx);
    renderBackgroundColor(ctx);

    renderHeadlineText(ctx);
    renderDateTimeText(ctx);
    renderLocationText(ctx);
    renderDescriptionText(ctx);
    renderWebsiteUrlText(ctx);

    //renderCredit(ctx);


    var data = this.canvas.toDataURL(); //.replace('image/png', 'image/octet-stream');
    this.$('#meme-download').attr({
      'href': data,
      'download': (d.downloadName || 'share') + '.png'
    });

    // Enable drag cursor while canvas has artwork:
    this.canvas.style.cursor = this.model.hasBackground() ? 'move' : 'default';
  },

  events: {
    'mousedown canvas': 'onDrag'
  },

  // Performs drag-and-drop on the background image placement:
  onDrag: function(evt) {
    evt.preventDefault();

    // Return early if there is no background image:
    if (!this.model.hasBackground()) return;

    // Configure drag settings:
    var model = this.model;
    var d = model.toJSON();
    var iw = model.background.width * d.imageScale / 2;
    var ih = model.background.height * d.imageScale / 2;
    var origin = {x: evt.clientX, y: evt.clientY};
    var start = d.backgroundPosition;
    start.x = start.x || d.width / 2;
    start.y = start.y || d.height / 2;

    // Create update function with draggable constraints:
    function update(evt) {
      evt.preventDefault();
      model.set('backgroundPosition', {
        x: Math.max(d.width-iw, Math.min(start.x - (origin.x - evt.clientX), iw)),
        y: Math.max(d.height-ih, Math.min(start.y - (origin.y - evt.clientY), ih))
      });
    }

    // Perform drag sequence:
    var $doc = MEME.$(document)
      .on('mousemove.drag', update)
      .on('mouseup.drag', function(evt) {
        $doc.off('mouseup.drag mousemove.drag');
        update(evt);
      });
  }
});
