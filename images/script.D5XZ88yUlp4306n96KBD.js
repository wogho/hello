function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var _n = 0,
        F = function F() {};
      return {
        s: F,
        n: function n() {
          return _n >= r.length ? {
            done: !0
          } : {
            done: !1,
            value: r[_n++]
          };
        },
        e: function e(r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o, a = !0,
    u = !1;
  return {
    s: function s() {
      t = t.call(r);
    },
    n: function n() {
      var r = t.next();
      return a = r.done, r;
    },
    e: function e(r) {
      u = !0, o = r;
    },
    f: function f() {
      try {
        a || null == t["return"] || t["return"]();
      } finally {
        if (u) throw o;
      }
    }
  };
}

function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
document.addEventListener('alpine:init', function() {
  return Alpine.store('header', {
    /**
     * @type {string}
     */
    title: '',
    /**
     * @type {boolean}
     */
    show: true
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('scrollspy', function() {
    return {
      /**
       * Show
       *
       * @type {boolean}
       */
      show: false,
      /**
       * On active Class
       *
       * @type {string}
       */
      activeClass: 'active',
      /**
       * Open
       *
       * @type {boolean}
       */
      open: false,
      /**
       * Scroll in offset
       *
       * @type {number}
       */
      offset: 81,
      // Scroll margin top + 1
      /**
       * Scollspy
       */
      scrollspy: function scrollspy() {
        this.track();
        this.on();
      },
      /**
       * Toggle
       */
      toggle: function toggle() {
        this.open = !this.open;
      },
      /**
       * Track
       */
      track: function track() {
        var _this = this;
        var $headings = this.$headings;
        $headings.forEach(function($heading, index) {
          if (_this["in"]($heading)) {
            _this.reset();
            _this.hit(index);
          }
        });
        var $heading = $headings.item(0);
        if (this.out($heading)) {
          this.reset();
        }
      },
      /**
       * On
       */
      on: function on() {
        this.show = this.$article.getBoundingClientRect().top < 0;
      },
      /**
       * Active
       *
       * @param {number} index
       */
      hit: function hit(index) {
        this.$data.headings[index].active = true;
      },
      /**
       * inactive All
       */
      reset: function reset() {
        this.$data.headings.forEach(function(spy) {
          return spy.active = false;
        });
      },
      /**
       * Scroll in heading
       *
       * @param {HTMLElement} $heading
       *
       * @returns {boolean}
       */
      "in": function _in($heading) {
        return $heading.getBoundingClientRect().top < this.offset;
      },
      /**
       * Scroll out heading
       *
       * @param {HTMLElement} $heading
       *
       * @returns {boolean}
       */
      out: function out($heading) {
        return $heading.getBoundingClientRect().top > 0;
      },
      /**
       * Article
       *
       * @returns {HTMLElement}
       */
      get $article() {
        return this.$refs.article;
      },
      /**
       * Get headings in content
       *
       * @return {NodeListOf<HTMLElement>}
       */
      get $headings() {
        return this.$article.querySelectorAll(this.$data.supportHeadings);
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('content', function() {
    return {
      /**
       * Support Headings
       *
       * @property {array} headings
       */
      supportHeadings: '.contents_style > h2, .contents_style > h3',
      /**
       * Headings
       *
       * @property {array} headings
       */
      headings: [],
      /**
       * Init 'content' Component
       */
      init: function init() {
        this.setAnchorToHeadings();
        this.collectHeading();
        this.highlightCodeBlocks();
        this.addBlankHashToMoreLesses();
        this.setPositionToImages();
      },
      /**
       * Add blank hash To morelesses
       */
      addBlankHashToMoreLesses: function addBlankHashToMoreLesses() {
        this.$article.querySelectorAll('a.btn-toggle-moreless').forEach(function($moreless) {
          $moreless.setAttribute('href', '#');
        });
      },
      /**
       * Syntax highlighting code blocks in template
       */
      highlightCodeBlocks: function highlightCodeBlocks() {
        this.$article.querySelectorAll('pre code').forEach(hljs.highlightElement);
      },
      /**
       * Collect heading in template
       */
      collectHeading: function collectHeading() {
        var _this2 = this;
        this.$headings.forEach(function($heading) {
          var heading = _this2.heading($heading);
          _this2.headings.push(heading);
        });
      },
      /**
       * Get new Scrollspy item
       *
       * @param {HTMLElement} $heading
       *
       * @return {object}
       */
      heading: function heading($heading) {
        return {
          tagName: $heading.tagName,
          id: $heading.id,
          href: "#".concat($heading.id),
          text: $heading.textContent,
          active: false
        };
      },
      /**
       * Set position to images
       */
      setPositionToImages: function setPositionToImages() {
        this.$article.querySelectorAll('figure.imageblock').forEach(this.setImageBlockPosition.bind(this));
        this.$article.querySelectorAll('figure.imagegridblock').forEach(this.setImageGridBlockPosition.bind(this));
      },
      /**
       * Set image block position
       *
       * @param {HTMLElement} $imageBlock
       */
      setImageBlockPosition: function setImageBlockPosition($imageBlock) {
        var width = this.imageBlockWidth($imageBlock);
        if ($imageBlock.classList.contains('alignCenter')) {
          this.setImageBlockToCenter($imageBlock);
        }
        if ($imageBlock.classList.contains('widthContent')) {
          return;
        }
        this.setImageBlockWidth($imageBlock, width);
      },
      /**
       * Set image grid block position
       *
       * @param {HTMLElement} $imageBlock
       */
      setImageGridBlockPosition: function setImageGridBlockPosition($imageBlock) {
        var width = this.imageGridBlockWidth();
        this.setImageBlockToCenter($imageBlock);
        this.setImageBlockWidth($imageBlock, width);
      },
      /**
       * Center image block
       *
       * @param {HTMLElement} $imageBlock
       */
      imageBlockWidth: function imageBlockWidth($imageBlock) {
        var $imageWrap = $imageBlock.querySelector('span, a');
        var $image = $imageWrap.querySelector('img');
        var width = $image.getAttribute('width') || $imageBlock.dataset.originWidth;
        return width > 1100 ? 1100 : width;
      },
      /**
       * Center image grid block
       */
      imageGridBlockWidth: function imageGridBlockWidth() {
        return 1100;
      },
      /**
       * set Image Width
       *
       * @param {HTMLElement} $imageBlock
       * @param {String|Number} width
       */
      setImageBlockWidth: function setImageBlockWidth($imageBlock, width) {
        $imageBlock.style.width = "".concat(width, "px");
        $imageBlock.style.maxWidth = "".concat(width, "px");
      },
      /**
       * set Image block to center
       *
       * @param {HTMLElement} $imageBlock
       */
      setImageBlockToCenter: function setImageBlockToCenter($imageBlock) {
        $imageBlock.style.marginLeft = '50%';
        $imageBlock.style.transform = 'translateX(-50%)';
      },
      /**
       * Set anchor to headings in template
       */
      setAnchorToHeadings: function setAnchorToHeadings() {
        this.$headings.forEach(this.setAnchorToHeading.bind(this));
      },
      /**
       * Set anchor to heading
       *
       * @param {HTMLElement} $heading
       * @param {number} index
       */
      setAnchorToHeading: function setAnchorToHeading($heading, index) {
        var link = this.link($heading, index);
        var $anchor = this.$anchor($heading, "#".concat(link));
        $heading.setAttribute('id', link);
        $heading.innerHTML = $anchor.outerHTML;
      },
      /**
       * Get link for heading
       *
       * @param {HTMLElement} $heading
       * @param {number} index
       *
       * @return {string}
       */
      link: function link($heading, index) {
        return this.$id(encodeURIComponent($heading.textContent), index);
      },
      /**
       * Get new anchor
       *
       * @param {HTMLElement} $heading
       * @param {string} link
       *
       * @return {HTMLElement}
       */
      $anchor: function $anchor($heading, link) {
        var $anchor = document.createElement('a');
        $anchor.setAttribute('href', link);
        $anchor.innerHTML = $heading.innerHTML;
        return $anchor;
      },
      /**
       * Get article template content
       *
       * @return {HTMLElement}
       */
      get $article() {
        return this.$refs.article;
      },
      /**
       * Get headings in content
       *
       * @return {NodeListOf<HTMLElement>}
       */
      get $headings() {
        return this.$article.querySelectorAll(this.supportHeadings);
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('tag', function() {
    return {
      /**
       * Init
       */
      init: function init() {
        this.removeAllCommas();
      },
      /**
       * Remove all commas
       */
      removeAllCommas: function removeAllCommas() {
        var _iterator = _createForOfIteratorHelper(this.$el.childNodes),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var node = _step.value;
            if (node.nodeType === 3) {
              node.remove();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('category', function() {
    return {
      /**
       * @var {Boolean} foldableCategory
       */
      foldableCategory: skinOptions.foldableCategory,
      /**
       * Init
       */
      init: function init() {
        if (this.foldableCategory) {
          this.$subCategories.forEach(this.foldable.bind(this));
        }
      },
      /**
       * Foldable
       *
       * @param {HTMLElement} $subCategory
       */
      foldable: function foldable($subCategory) {
        $subCategory.parentNode.setAttribute('x-data', '{ open: false }');
        $subCategory.setAttribute('x-show', 'open');
        $subCategory.setAttribute('x-collapse', '');
        var $icon = this.$icon;
        $icon.setAttribute('x-on:click', 'open = ! open');
        $icon.setAttribute(':class', '{ "rotate-90 duration-200": open }');
        $subCategory.parentNode.prepend($icon);
      },
      /**
       * Get subcategories
       *
       * @var {NodeListOf<HTMLElement>} $subCategories
       */
      get $subCategories() {
        return this.$el.querySelectorAll('.sub_category_list');
      },
      /**
       * Get a new icon
       *
       * @var {HTMLElement} $icon
       */
      get $icon() {
        var icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-chevron-right');
        return icon;
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.store('indicator', {
    /**
     * Scrolled
     */
    scrolled: 0,
    /**
     * Scroll indicate
     */
    indicate: function indicate() {
      var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      this.$store.indicator.scrolled = winScroll / height * 100;
    }
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('top', function() {
    return {
      /**
       * @property {boolean} open
       */
      open: true,
      /**
       * Init
       */
      init: function init() {
        this.toggle();
      },
      /**
       * Toggle
       */
      toggle: function toggle() {
        var _this3 = this;
        this.$targets.forEach(function(el) {
          if (document.body.contains(el)) {
            _this3.open = el.getBoundingClientRect().bottom < 0;
          }
        });
      },
      /**
       * targets
       *
       * @returns {Array<HTMLElement>}
       */
      get $targets() {
        return [this.$refs.header, this.$refs.globalHeader];
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('menuToolbar', function() {
    return {
      /**
       * Init
       */
      init: function init() {
        if (/^(.*\.tistory\.com)$/.test(location.hostname)) {
          this.setTistoryMenubar();
        }
      },
      /**
       * Set TISTORY menu toolbar
       */
      setTistoryMenubar: function setTistoryMenubar() {
        var tistoryMenubar = document.getElementById('menubar_wrapper');
        if (tistoryMenubar) {
          tistoryMenubar.setAttribute('x-data', 'tistoryMenubar');
          tistoryMenubar.setAttribute('x-on:resize.window', 'toggle');
          this.$el.append(tistoryMenubar);
        }
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('subscribe', function() {
    return {
      /**
       * Can subscribe?
       */
      canSubscribe: function canSubscribe() {
        return T.config.ROLE !== "owner" && /^(.*\.tistory\.com)$/.test(location.hostname);
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('tistoryMenubar', function() {
    return {
      /**
       * Init
       */
      init: function init() {
        this.toggle();
      },
      /**
       * Toggle TISTORY menu toolbar by hidden condition
       */
      toggle: function toggle() {
        this.$el.style.display = this.hidden ? 'none' : 'inline-block';
      },
      /**
       * Is hidden?
       *
       * @var {boolean}
       */
      get hidden() {
        var containerLg = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--h-idx'), 10);
        return T.config.ROLE !== "owner" && window.innerWidth < containerLg; // max-lg
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('bottom', function() {
    return {
      /**
       * Toggle Theme
       */
      toggleTheme: function toggleTheme() {
        darkMode.toggle();
        this.$data.dark = !this.$data.dark;
      }
    };
  });
});
document.addEventListener('alpine:init', function() {
  return Alpine.data('app', function() {
    return {
      /**
       * @type {boolean}
       */
      dark: darkMode.on,
      /**
       * @type {boolean}
       */
      loading: true,
      /**
       * Init
       */
      init: function init() {
        this.loaded();
      },
      /**
       * Loaded
       */
      loaded: function loaded() {
        var _this4 = this;
        setTimeout(function() {
          return _this4.loading = false;
        }, 100);
      }
    };
  });
});
window.addEventListener('DOMContentLoaded', function() {
  return Alpine.start();
});