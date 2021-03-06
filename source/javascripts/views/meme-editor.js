/*
* MemeEditorView
* Manages form capture, model updates, and selection state of the editor form.
*/
MEME.MemeEditorView = Backbone.View.extend({

  initialize: function() {
    this.buildForms();
    this.listenTo(this.model, 'change', this.render);
    this.render();

    /*
    $(".tab").click(function() {
      $("." + $(this).attr("data-pane")).css(
        "display",
        "block"
      ), $(this).css("border-bottom", "2px solid rgba(76, 78, 77, .2)"), $(this).siblings().css("border-bottom", "2px solid rgba(76, 78, 77, .025)"), $("." + $(this).siblings().attr("data-pane")).css("display", "none");
    });
    */
  },

  // Builds all form options based on model option arrays:
  buildForms: function() {
    var d = this.model.toJSON();

    function buildOptions(opts) {
      return _.reduce(
        opts,
        function(memo, opt) {
          return (memo += [
            '<option value="', opt.hasOwnProperty("value") ? opt.value : opt, '">', opt.hasOwnProperty("text") ? opt.text : opt,"</option>"].join(""));
        },
        ""
      );
    }
    // Build aspect ratio options:
    $('#aspect-ratio').append(buildOptions(d.aspectRatioOpts)).show();

    if (d.textShadowEdit) {
      $('#text-shadow').parent().show();
    }

    // Build text alignment options:
    if (d.textAlignOpts && d.textAlignOpts.length) {
      $('#text-align').append(buildOptions(d.textAlignOpts)).show();
    }

    // Build font family options:
    if (d.fontFamilyOpts && d.fontFamilyOpts.length) {
      $('#font-family').append(buildOptions(d.fontFamilyOpts)).show();
    }

    // Build font color options:
    if (d.fontColorOpts && d.fontColorOpts.length) {
      var fontOpts = _.reduce(
        d.fontColorOpts,
        function(memo, opt) {
          var color = opt.hasOwnProperty("value") ? opt.value : opt;
          return (memo +=
            '<li><label><input class="m-editor__swatch" style="background-color:' +
            color +
            '" type="radio" name="font-color" value="' +
            color +
            '"></label></li>');
        },
        ""
      );

      $("#font-color").show().find("ul").append(fontOpts);
    }

    // Build bg image options:
    if (d.imageOpts && d.imageOpts.length) {
      $('#image').append(buildOptions(d.imageOpts)).show();
    }

    // Build overlay color options:
    if (d.overlayColorOpts && d.overlayColorOpts.length) {
      var overlayOpts = _.reduce(
        d.overlayColorOpts,
        function(memo, opt) {
          var color = opt.hasOwnProperty("value") ? opt.value : opt;
          return (memo +=
            '<li><label><input class="m-editor__swatch" style="background-color:' +
            color +
            '" type="radio" name="overlay" value="' +
            color +
            '"></label></li>');
        },
        ""
      );

      $("#overlay").show().find("ul").append(overlayOpts);
    }

  // Build background color options:
  if (d.backgroundColorOpts && d.backgroundColorOpts.length) {
    var backgroundOpts = _.reduce(
      d.backgroundColorOpts,
      function(memo, opt) {
        var color = opt.hasOwnProperty("value") ? opt.value : opt;
        return (memo +=
          '<li><label><input class="m-editor__swatch" style="background-color:' +
          color +
          '" type="radio" name="background-color" value="' +
          color +
          '"></label></li>');
      },
      ""
    );

    $("#background-color").show().find("ul").append(backgroundOpts);
  }
},

  render: function() {
    var d = this.model.toJSON();
    // text inputs
    this.$('#headline').val(d.headlineText);
    this.$('#date-time').val(d.dateTimeText);
    this.$('#location').val(d.locationText);
    this.$('#location-2').val(d.locationTwoText);
    this.$('#website-url').val(d.websiteUrlText);

    this.$('#aspect-ratio').val(d.aspectRatio);
    // this.$('#image-scale').val(d.imageScale);
    this.$('#image').val(d.imageSrc);

    this.$('#title-font-size').val(d.fontSize);
    this.$('#font-family').val(d.fontFamily);
    this.$("#font-color").find('[value="' + d.fontColor + '"]').prop("checked", true);
    this.$("#overlay-alpha").val(d.overlayAlpha);
    this.$('#text-align').val(d.textAlign);
    this.$('#text-shadow').prop('checked', d.textShadow);
    this.$('#overlay').find('[value="'+d.overlayColor+'"]').prop('checked', true);
    this.$("#backgroundcolor").find('[value="' + d.backgroundColor + '"]').prop("checked", true);
  },

  events: {
    'input #headline': 'onHeadline',
    'input #date-time': 'onDateTime',
    'input #location': 'onLocation',
    'input #location-2': 'onLocationTwo',
    'input #website-url': 'onWebsiteUrl',
    'input #credit': 'onCredit',
    'input #image-scale': 'onScale',

    'change #image': 'onImage',

    'change #aspect-ratio': 'onAspectRatio',
    'change #title-font-size': 'onFontSize',
    'change #font-family': 'onFontFamily',
    'change [name="font-color"]': "onFontColor",
    "change #text-align": "onTextAlign",
    "change #text-shadow": "onTextShadow",
    "change #overlay-alpha": "onOverlayAlpha",
    'change [name="overlay"]': "onOverlayColor",
    'change [name="background-color"]': "onBackgroundColor",
  },

  onCredit: function() {
    this.model.set('creditText', this.$('#credit').val());
  },

  onHeadline: function() {
    this.model.set('headlineText', this.$('#headline').val());
  },
  onDateTime: function() {
    this.model.set('dateTimeText', this.$('#date-time').val());
  },
  onLocation: function() {
    this.model.set('locationText', this.$('#location').val());
  },
  onLocationTwo: function() {
    this.model.set('locationTwoText', this.$('#location-2').val());
  },
  onWebsiteUrl: function() {
    this.model.set('websiteUrlText', this.$('#website-url').val());
  },

  onAspectRatio: function() {
    this.model.set("aspectRatio", this.$("#aspect-ratio").val())
  },
  onTextAlign: function() {
    this.model.set('textAlign', this.$('#text-align').val());
  },

  onTextShadow: function() {
    this.model.set('textShadow', this.$('#text-shadow').prop('checked'));
  },

  onFontSize: function() {
    this.model.set('fontSize', this.$('#title-font-size').val());
  },

  onFontFamily: function() {
    this.model.set('fontFamily', this.$('#font-family').val());
  },

  onFontColor: function(evt) {
    this.model.set("fontColor", this.$(evt.target).val());
  },
  onImage: function() {
    this.model.set('imageSrc', this.$('#image').val());
    if (localStorage) localStorage.setItem('meme_image', this.$('#image').val());
  },

  onScale: function() {
    this.model.set('imageScale', this.$('#image-scale').val());
  },

  onOverlayAlpha: function() {
    this.model.set("overlayAlpha", this.$("#overlay-alpha").val());
  },

  onOverlayColor: function(evt) {
    this.model.set('overlayColor', this.$(evt.target).val());
  },

  onBackgroundColor: function(evt) {
    this.model.set("backgroundColor", this.$(evt.target).val());
  },

  getDataTransfer: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    return evt.originalEvent.dataTransfer || null;
  },
});
