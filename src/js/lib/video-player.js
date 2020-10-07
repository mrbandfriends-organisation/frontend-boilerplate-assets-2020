/**
 * VIDEO MODULE
 *
 * The following comment sets elVideo to be a global variable, as it is not defined in this file.
 */
/* global elVideo */
import applyMixins from 'lib/apply-mixins';
import triggerCallback from 'lib/mixins/trigger-callback';
import EventBus from 'lib/eventbus';
import logger from 'lib/logger';

class VideoPlayer {
    constructor(el, options) {
        this.el = el;
        this.isPlaying = false;
        this.onCanPlayThroughCalled = false;

        options = options || {};

        this.settings = Object.assign(
            {
                videoEl: 'video',
                playEl: '.js-video-player-play',
                pauseEl: '.js-video-player-pause',
                toggleEl: '.js-video-player-toggle',
                fireCurrentTime: false,
                pauseOnPlayerClick: true,
                pauseOnResize: false
            },
            options
        );

        // Derived selectors
        this.videoEl = this.el.querySelector(this.settings.videoEl);
        this.playEl = this.el.querySelector(this.settings.playEl);
        this.pauseEl = this.el.querySelector(this.settings.pauseEl);
        this.toggleEl = this.el.querySelector(this.settings.toggleEl);

        this.controls = [this.pauseEl, this.playEl, this.toggleEl];

        if (this.videoEl) {
            this.init();
        } else {
            logger('Video Module: no videoEl detected');
        }
    }

    init() {
        this.addListeners();
    }

    setNewVideo(newVideo) {
        this.videoEl.setAttribute('src', newVideo);
        this.videoEl.load();
    }

    startBuffering() {
        this.videoEl.preload = 'auto';
        this.videoEl.load();
    }

    addListeners() {
        var _this = this;

        // Aways stop on resize because of tablet orientation change
        window.addEventListener('resize', e => {
            if (this.settings.pauseOnResize) {
                this.stop();
            }

            this.triggerCallback('onResize');
        });

        // If another player starts playing then stop this one
        EventBus.subscribe('video-player.playing', (e, data) => {
            if (data.module.el !== this.el) {
                this.stop();
            }
        });

        if (this.playEl) {
            this.playEl.addEventListener('click', e => {
                e.preventDefault();
                this.start();
            });
        }

        if (this.pauseEl) {
            this.pauseEl.addEventListener('click', e => {
                e.preventDefault();
                this.stop();
            });
        }

        if (this.toggleEl) {
            this.toggleEl.addEventListener('click', e => {
                e.preventDefault();
                this.toggleVideoPlayState();
            });
        }

        this.videoEl.addEventListener('loadedmetadata', e => {
            this.triggerCallback('onProgress');
        });

        this.videoEl.addEventListener('ended', e => {
            this.stop();
            this.triggerCallback('onEnd');
        });

        // Handle programmatic or toggle via DOM "controls"
        this.videoEl.addEventListener('pause', e => {
            this.stop({
                preventRepeatEvent: true
            });
        });

        // Handle programmatic or toggle via DOM "controls"
        this.videoEl.addEventListener('play', e => {
            this.start({
                preventRepeatEvent: true
            });
        });

        this.videoEl.addEventListener('canplaythrough', e => {
            if (!this.onCanPlayThroughCalled) {
                this.triggerCallback('onCanPlayThrough');
            }

            this.onCanPlayThroughCalled = true;
        });

        if (this.settings.fireCurrentTime) {
            this.videoEl.addEventListener('timeupdate', event => {
                var currentTime = this.currentTime;
                var duration = this.duration;

                this.triggerCallback('onVideoCurrentTimeUpdate', {
                    module: _this,
                    currentTime: currentTime,
                    duration: duration
                });
            });
        }
    }

    start(args) {
        var _this = this;

        args = args || {};

        this.isPlaying = true;

        // Update classes
        this.el.classList.add('playing');
        this.el.classList.add('is-playing');
        this.el.classList.remove('is-paused');

        if (this.toggleEl) {
            this.toggleEl.textContent = 'Pause';
            this.toggleEl.classList.add('is-playing');
            this.toggleEl.classList.remove('is-paused');
        }

        this.addVideoEvents();

        if (args.preventRepeatEvent === undefined || !args.preventRepeatEvent) {
            // Get DOM video el and init play
            this._play();
        }

        // Trigger global event to tell other players to stop
        EventBus.publish('video-player.playing', {
            module: _this
        });

        _this.triggerCallback('onStart');
    }

    bufferPercentage() {
        const vid = this.videoEl;

        const bufferedPercent = vid.duration > 0 && vid.buffered.length > 0
            ? vid.buffered.end(0) / vid.duration * 100
            : 0;

        return bufferedPercent;
    }

    bufferPos() {
        const videoEl = this.videoEl;
        const bufferedAmount = videoEl.duration > 0 &&
            videoEl.buffered.length > 0
            ? videoEl.buffered.end(0)
            : 0;
        return bufferedAmount;
    }

    stop(args) {
        var _this = this;

        args = args || {};

        this.isPlaying = false;
        this.el.classList.remove('playing');
        this.el.classList.remove('is-playing');
        this.el.classList.add('is-paused');

        if (this.toggleEl) {
            this.toggleEl.textContent = 'Play';
            this.toggleEl.classList.remove('is-playing');
            this.toggleEl.classList.add('is-paused');
        }

        this.removeVideoEvents();

        if (args.preventRepeatEvent === undefined || !args.preventRepeatEvent) {
            // Get DOM video el and init pause
            this._pause();
        }

        this.triggerCallback('onStop');
    }

    addVideoEvents() {
        var handler = this.toggleVideoPlayState.bind(this);

        if (this.settings.pauseOnPlayerClick) {
            this.videoEl.addEventListener('click', handler);
        }
    }

    toggleVideoPlayState() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    removeVideoEvents() {
        var handler = this.toggleVideoPlayState.bind(this);

        this.videoEl.removeEventListener('click', handler);
    }

    _play() {
        // Get DOM video el and init play
        this.videoEl.play();
    }

    _pause() {
        // Get DOM video el and init pause
        this.videoEl.pause();
    }

    destroyVideo() {
        var video = this.videoEl;
        var tmp = video.src;

        this._pause();

        video.src = ''; // empty the video source first
        video.load(); // the load in the empty src which causes buffering to cease

        this.videoEl.remove(); // remove video entirely for good measure
    }

    destroyControls() {
        this.controls.forEach(control => control && control.remove());
    }
}

// Apply Mixins
applyMixins(VideoPlayer, triggerCallback);

// Export
export default VideoPlayer;
