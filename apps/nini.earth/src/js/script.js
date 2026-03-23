/**
 * @fileoverview Kanye 2049 Tribute - Main JavaScript Application
 * 
 * This file contains the core functionality for the Kanye 2049 tribute website.
 * It implements a retro-futuristic interface with BIOS-style boot sequence,
 * audio player functionality, and interactive elements.
 * 
 * @author Aaron Woods
 * @version 1.0.0
 * @license ISC
 */

(function($){
  /**
   * @type {boolean} - Controls whether to display the boot sequence
   */
  var displayBoot = true;
  
  /**
   * @type {boolean} - Controls the CRT monitor effect
   */
  var crtEffect = true;
  
  /**
   * @type {boolean} - Controls ambient background audio
   */
  var ambientSound = false;

  /**
   * IE11 forEach polyfill for NodeList
   * Adds forEach method to NodeList prototype for older browsers
   */
  if (typeof NodeList !== "undefined" && NodeList.prototype && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  /**
   * Google Analytics Custom Events Handler
   * Sets up click event listeners for elements with 'ga-ce' class
   * Sends custom events to Google Analytics when triggered
   */
  var gaCustomEventTrigger = document.querySelectorAll('.ga-ce');
  gaCustomEventTrigger.forEach(function(e,i){
    e.addEventListener('click', function(){
      var category = this.dataset.category ? this.dataset.category : null,
      action = this.dataset.action ? this.dataset.action : null,
      label = this.dataset.label ? this.dataset.label : null,
      value = this.dataset.value ? this.dataset.value : 1;

      if(window.ga && ga.create) {
        ga('send', 'event', category, action, label, value, null);
      }
    });
  });

  /**
   * Share Popup Manager
   * Handles social media sharing functionality
   * @type {Object}
   */
  var sharePopups = undefined;
	sharePopups = {
		/** @type {jQuery} - Share popup trigger elements */
		triggers : $('.share-popup'),

		/**
		 * Initialize share popup functionality
		 * Sets up click handlers for share buttons
		 */
		init: function(){
			var self = this;
			self.triggers.click(function(e){
				e.preventDefault();
				self.popup($(this).attr('href'));
			});
		},
		
		/**
		 * Opens a popup window for sharing
		 * @param {string} target - The URL to open in the popup
		 */
		popup: function(target){
		    //console.log(target);
		    popupWindow = window.open(target,'','width=600,height=400');
		    popupWindow.focus();
		}
	};
	sharePopups.init();

  /**
   * Main System Object
   * Controls the core application functionality including boot sequence,
   * audio playback, and UI interactions
   * @type {Object}
   */
  var system = {
    /** @type {jQuery} - Main screen container */
    view: $('.screen'),
    /** @type {jQuery} - BIOS boot screen element */
    bios: $('.screen .bios'),
    /** @type {boolean} - Whether the system has been started */
    started: false,
    /** @type {Object} - Loading state flags */
    loading: {
      audio: false,
      video: false
    },
    /** @type {Audio} - Background ambient audio player */
    ambientAudio: new Audio('sound/ambient.mp3'),
    /** @type {HTMLAudioElement} - Main audio player for music tracks */
    audioPlayer: document.createElement('audio'),
    
    /**
     * Boot sequence text array
     * Contains the BIOS-style startup messages
     * @type {Array<string>}
     */
    text: [
      '<p>niniOS</p>'+
      '<p>Copyright (c) 1997,'+ new Date().getFullYear()+ '. All Rights Reserved</p>'+
      '<p>BIOS Version: 0.1.1.2</p>'+
      '<p>Core Singularity Matrix: Version 3.5.8.12</p>'+
      '<br />',
      '<p>Quantum Battery Status: 98% - Harmonized</p>',
      '<p>Neural Memory Alignment: 16384K - Synchronized</p>',
      '<p>Aligning Multiverse Interfaces ... Unified</p>',
      '<br />'+
      "<p>niniOS signifies the creative interplay between two worlds - expanding perspectives on what an operating system can be. By infusing technology with shades of humanity, this OS blends the precision of code with the wild, untamed pulse of the universe - connecting silicon with the soul.</p>",
      '<br />' +
      '<br />',
      '<p>Press Any Key to boot system</p>'
    ],
    
    /**
     * Media session action handlers
     * Maps media control actions to system functions
     * @type {Array<Array>}
     */
    actionHandlers: [
        ['play', () => { this.resumeTrack(); }],
        ['pause', () => { this.pauseTrack(); }],
        ['stop', () => { this.stopTrack(); }]
    ],
    
    /**
     * Initialize the system
     * Sets up event listeners, audio players, and starts the boot sequence
     */
    init: function(){
      var self = this;

      self.setBodyHeight();

      // Detect iOS device for special handling
      var agent=navigator.userAgent.toLowerCase();
      self.isIPhone = (agent.indexOf('iphone')!=-1);

      self.displayTime();

      // Start boot sequence after a short delay
      setTimeout(function(){ self.boot(); }, 100);

      // Set up media session handlers for system media controls
      for (const [action, handler] of self.actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
          console.log(`The media session action "${action}" is not supported yet.`);
        }
      }

      // Handle user interaction to start the system
      $(window).on('keyup click', function(e){
        if(!system.started){
          self.bios.hide();
          self.setLoading(true);
          setTimeout(function(){
            $('.login').addClass('loaded');
            // $('.login input[type="password"]').focus();
            self.setLoading(false);
          }, 1500);

          // Start ambient audio if enabled and not on iOS
          if(ambientSound && !self.isIPhone){
            self.ambientAudio.play();
            $(self.ambientAudio).animate({volume: .2}, 3000);
          }
          system.started = true;
        }
      });

      // Custom cursor movement (commented out)
      // $(window).on('mousemove', function(e){
      //     $(".cursor").css({left:e.pageX, top:e.pageY});
      // });

      // Configure ambient audio for seamless looping
      self.ambientAudio.loop = true;
      self.ambientAudio.volume = 0;
      self.ambientAudio.addEventListener('timeupdate', function(){
        var buffer = .44
        if(this.currentTime > this.duration - buffer){
            this.currentTime = 0
            this.play()
        }
      });

      // Handle audio player events
      $(self.audioPlayer).on('ended', function(){
        self.stopTrack();
      });

      $(self.audioPlayer).on("stalled", function() {
        var audio = this;
        console.log("audio stalled");
        audio.load();
        //audio.play();
      });

      // Handle video player events
      $('#video').on("stalled", function() {
        var video = this;
        console.log("video stalled");
        video.load();
        //video.play();
      });

      // Set up media session handlers for system integration
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler("pause", function() {
          self.pauseTrack();
        });
        navigator.mediaSession.setActionHandler("play", function() {
          self.resumeTrack();
        });
        navigator.mediaSession.setActionHandler("seekto", function(details) {
          self.audioPlayer.currentTime = details.seekTime;
        });
      }
    },
    
    /**
     * Set body height to viewport height
     * Ensures full viewport coverage and handles mobile browsers
     */
    setBodyHeight: function(){
      var self = this;
      $('body').css('height', window.innerHeight);

      // Recursively call to handle dynamic height changes
      setTimeout(self.setBodyHeight, 100);
    },
    
    /**
     * Set loading state
     * Adds or removes loading class and cursor
     * @param {boolean} state - Whether to show loading state
     */
    setLoading: function(state){
      var self = this;
      if(state){
        $('body').addClass('loading');
      } else {
        $('body').removeClass('loading');
      }
    },
    
    /**
     * Format date to AM/PM format with month and day
     * @param {Date} date - Date object to format
     * @returns {string} Formatted time string
     */
    formatAMPM: function (date) {
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ampm + '<span> - ' + monthNames[date.getMonth()] + '. ' + date.getDate() + ', ' + date.getFullYear() + '</span>';
      return strTime;
    },
    
    /**
     * Display current time
     * Updates the time display every second
     */
    displayTime: function(){
      var self = this;
      var time = self.formatAMPM(new Date);
      $('#time').html(time);
      setTimeout(function(){ self.displayTime(); }, 1000);
    },
    
    /**
     * Initialize boot sequence
     * Sets up the retro-futuristic boot experience
     */
    boot: function(){
      var self = this;
      // Hide fullscreen toggle on iOS devices

      if (self.isIPhone){
        $('.hide-on-ios').hide();
      }

      // Apply CRT effect if enabled
      if(crtEffect){
        $('body').addClass('crt');
      }
      if(!displayBoot){
        self.bios.hide();
        $('.login').hide();
      } else {
        self.view.fadeIn(100, function(){
          $.each(self.text, function(i,e){
            setTimeout(function(){
              self.bios.append(e)
          }, i*700);
          });
        });
      }
    },
    toggleAmbientSound: function(status){
      var self = this;
      if(status){
        $(self.ambientAudio).animate({volume: .2}, 3000);
      } else {
        $(self.ambientAudio).animate({volume: 0}, 8000);
      }
    },
    loadTrack: function(item){
      var self = this;
      //console.log('play', item);

      self.loading.video = false;
      self.loading.audio = false;

      self.setLoading(true);

      $(self.audioPlayer).on('canplay', function(){
        self.playTrack('audio');
      });

      $('#video').on('canplay', function(){
        self.playTrack('video');
      });

      self.playingTrack = item;
      item.addClass('active playing');
      var track = item.attr('data-sound');
      var video = item.attr('data-video');
      var title = item.attr('data-title');
      var album = item.attr('data-album');

      $('#video .mpeg').attr('src', "video/"+video+".mp4");
      $('#video .webm').attr('src', "video/"+video+".webm");
      $('#video').get(0).load();

      self.audioPlayer.src = "sound/"+track;
      self.audioPlayer.load();

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title,
          artist: 'Toasty Digital',
          album: album,
          artwork: [
            { src: 'img/cover/'+album+'_96x96.png',   sizes: '96x96',   type: 'image/png' },
            { src: 'img/cover/'+album+'_128x128.png', sizes: '128x128', type: 'image/png' },
            { src: 'img/cover/'+album+'_192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'img/cover/'+album+'_256x256.png', sizes: '256x256', type: 'image/png' },
            { src: 'img/cover/'+album+'_384x384.png', sizes: '384x384', type: 'image/png' },
            { src: 'img/cover/'+album+'_512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }
    },
    playTrack: function(media){
      var self = this;
      if(media == 'audio'){
        self.loading.audio = true;
      }
      if(media == 'video'){
        self.loading.video = true;
      }
      if(self.loading.audio && self.loading.video){
        self.setLoading(false);
        self.resumeTrack();
        $('body').addClass('media-playing');
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
      }
    },
    stopTrack: function(){
      var self = this;
      //console.log('stop', self.playingTrack);

      $(self.audioPlayer).unbind('canplay');
      $('#video').unbind('canplay');
      $('body').removeClass('media-playing');

      $('#video').stop(true, true).fadeOut(800);
      setTimeout(function(){
        $('#video').get(0).pause()
      }, 800);
      self.audioPlayer.pause();
      self.playingTrack.removeClass('active playing');
      if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
      }
      //self.toggleAmbientSound(true);
    },
    pauseTrack: function(){
      var self = this;
      //console.log('pause', self.playingTrack);
      $('#video').get(0).pause();

      self.audioPlayer.pause();
      navigator.mediaSession.playbackState = 'paused';
      //self.toggleAmbientSound(true);
    },
    resumeTrack: function(){
      var self = this;
      //console.log('resume', self.playingTrack);
      $('#video').stop(true, true).fadeIn(800);
      $('#video').get(0).play();
      self.audioPlayerPromise = self.audioPlayer.play();
      //self.toggleAmbientSound(false);
    }
  };

  system.init();

  $('.login .hint a').on('click', function(e){
    e.preventDefault();
    $(this).parent('.hint').find('a').hide();
    $(this).parent('.hint').find('span').show();
  });

  $('.login form').on('submit', function(e){
    e.preventDefault();
    var answers = 
    ['YXJpZXM=', // aries
    'dGF1cnVz', // taurus
    'Z2VtaW5p', // gemini
    'Y2FuY2Vy',   // cancer
    'bGVv', // leo
    'dmlyZ28=', // virgo
    'bGlicmE=', // libra
    'c2NvcnBpbw==', // scorpio
    'c2FnaXR0YXJpdXM=', // sagittarius
    'Y2Fwcmljb3Ju', // capricorn
    'YXF1YXJpdXM=',  // aquarius
    'cGlzY2Vz']; // pisces
    var value = $('.login form input[type=password]').val().toLowerCase();
  // // Debugging output
  // console.log("Input value (lowercase): " + value);
  // console.log("Encoded input: " + btoa(value));

    if(answers.includes(btoa(value))){
      $('.login').removeClass('loaded');
      setTimeout(function(){
        $('.login').hide();
        system.toggleAmbientSound(false);
        system.setLoading(false);
      }, 1800);
    } else {
      $('.login form input[type=password]').val('');
    }
  });

  $('.navbar .item.submenu button').on('click', function(e){
    if(!$(this).parent('.submenu').hasClass('active')){
      $('.navbar .item.submenu.active').removeClass('active');
      $(this).parent('.submenu').addClass('active');
    } else {
      $('.navbar .item.submenu.active').removeClass('active');
    }
  });

  $('body').on('click', function(e){
    if($(e.target).closest('.item.submenu.active').length <= 0){
      $('.navbar .item.submenu.active').removeClass('active');
    }
    if($(e.target).closest('.dialog, .navbar').length <= 0){
      $('.dialog').css('display', 'none').html('');
    }
    $('.file').removeClass('active');
  });

  $('.disabled').on('click', function(e){
    e.preventDefault();
  });

  $('#about').on('click', function(e){
    e.preventDefault();
    $('.navbar .item.submenu.active').removeClass('active');
    var content = '<div><p>Mixtapes by <a href="https://twitter.com/jonsantoast" target="_blank">toasty digital</a><br />'+
    'Website by <a href="https://twitter.com/starfennec" target="_blank">starfennec</a><br />'+
    'Funny dancing lizard by <a href="https://twitter.com/ka92/" target="_blank">ka92</a>'+
    '</p></div>';
    $('.dialog').html(content).css('display', 'flex');
  });

  $('#battery').on('click', function(e){
    e.preventDefault();
    $('.navbar .item.submenu.active').removeClass('active');
    var content = '<div><p>Your device contains the GuitarBeat Infinity Core - a quantum battery for traversing cosmic dimensions. The Core powers niniOS to channel frequencies beyond perceived reality. Even mild vibrational mismatches may destabilize your journey, so handle with utmost care and avoid sources of cosmic turbulence like heat or moisture.If you feel yourself slipping into a negative thought loop, contact your Guide immediately to re-align the powercells. GuitarBeat is not liable for journeys gone astray. Stay centered and ride the wave.</p></div>';
    $('.dialog').html(content).css('display', 'flex');
  });
  



  $('#fullscreen').on('click', function(e){
    e.preventDefault();
    $('.navbar .item.submenu.active').removeClass('active');
    var elem = document.documentElement;

    if($('body').hasClass('fullscreen')){
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
      $('body').removeClass('fullscreen');
    } else {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
      $('body').addClass('fullscreen');
    }
  });

  $('#restart').on('click', function(e){
    e.preventDefault();
    location.reload();
  });

  $('#print').on('click', function(e){
    $('.navbar .item.submenu.active').removeClass('active');
    e.preventDefault();
    window.print();
  });

  $('#switchfiles').on('click', function(e){
    e.preventDefault();
    $('.navbar .item.submenu.active').removeClass('active');
    $(this).toggleClass('invert');
    $('body').toggleClass('show-hidden-files');
  });

  $('#folder1').on('click', function(e){
    e.preventDefault();
    $('.finder').removeClass('focus');
    $('.finder.2k49').addClass('focus').show('slow');
    $(this).addClass('active');
  });

  $('#folder2').on('click', function(e){
    e.preventDefault();
    $('.finder').removeClass('focus');
    $('.finder.gktfolder').addClass('focus').show('slow');
    $(this).addClass('active');
  });

  $('#folder3').on('click', function(e){
    e.preventDefault();
    $('.finder').removeClass('focus');
    $('.finder.blondafolder').addClass('focus').show('slow');
    $(this).addClass('active');
  });

  $('#folder4').on('click', function(e){
    e.preventDefault();
    $('.finder').removeClass('focus');
    $(this).addClass('active');
    setTimeout(function(){
      var content = '<div><p>File corrupted!<br />Please download it again.</p></div>';
      $('.dialog').html(content).css('display', 'flex');
    }, 0);
    $(this).addClass('active');
  });

  $('#lizard').on('click', function(e){
    e.preventDefault();
    $('#video2').get(0).play();
    $('.finder.fdl').addClass('focus').show();
  });

  $('#readme').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('.finder.readme').addClass('focus').show('slow');
  });

  $('#earththt').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('.finder.earth').addClass('focus').show('slow');
  });

  $('.finder .close').on('click', function(e){
    e.preventDefault();
    $(this).closest('.finder').hide();
  });

  $('.play-track').on('click', function(e){
    e.preventDefault();
    var item = $(this);
    if(!item.hasClass('playing')){
      //system.toggleAmbientSound(false);
      system.setLoading(true);
      if(system.playingTrack){
        system.stopTrack();
        setTimeout(function(){
          system.loadTrack(item);
        }, 800);
      } else {
        system.loadTrack(item);
      }
    }
  });

  $('#pause').on('click', function(e){
    e.preventDefault();
    if(system.audioPlayer.paused){
      $(this).removeClass('invert');
      system.resumeTrack();
    } else {
      $(this).addClass('invert');
      system.pauseTrack();
    }

  });
  $('#stop').on('click', function(e){
    e.preventDefault();
    $('body').removeClass('media-playing');
    system.stopTrack();
  });

$('.finder').on('mousedown click', function(e){
  $('.finder.focus').removeClass('focus');
  $(this).addClass('focus');
});

$('.finder').each(function(i,e){
  dragElement(e);
});


function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if ($(elmnt).find('.header').get(0)) {
    $(elmnt).find('.header').get(0).onmousedown = dragMouseDown;
    $(elmnt).find('.header').get(0).ontouchstart = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
    elmnt.ontouchstart = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    if (e.cancelable) { /* e.preventDefault(); */ }
    // get the mouse cursor position at startup:
    if(e.touches){
      var clientX = e.touches[0].pageX;
      var clientY = e.touches[0].pageY;
    } else {

      var clientX = e.clientX;
      var clientY = e.clientY;
    }

    pos3 = clientX;
    pos4 = clientY;

    document.onmouseup = closeDragElement;
    document.ontouchend = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    document.ontouchmove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    if (e.cancelable) { e.preventDefault(); }

    if(e.touches){
      var clientX = e.touches[0].pageX;
      var clientY = e.touches[0].pageY;
    } else {
      var clientX = e.clientX;
      var clientY = e.clientY;
    }
    // calculate the new cursor position:
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;

    var posY = (elmnt.offsetTop - pos2  >= 28) ? elmnt.offsetTop - pos2 : 28;
    var posX = (elmnt.offsetLeft - pos1 >= 0) ? elmnt.offsetLeft - pos1 : 0;
    // set the element's new position:
    elmnt.style.top = posY + "px";
    elmnt.style.left = posX + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.ontouchend = null;
    document.onmousemove = null;
    document.ontouchmove = null;
  }
}

})(jQuery);
