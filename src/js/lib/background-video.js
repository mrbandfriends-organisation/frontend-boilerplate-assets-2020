import VideoPlayer from 'lib/video-player';
import applyMixins from 'lib/apply-mixins';
import objectFitVideo from 'lib/mixins/object-fit-video';
import delay from 'lib/delay';

class BackgroundVideo {
    constructor(el, options) {
        // Accept selector or existing Node ref
        this.el = el && el.nodeType ? el : document.querySelector(el);

        this.videoIsDirty = false;

        // Options
        this.settings = Object.assign(
            {
                videoLoadTimeout: 3000,
                requiredBuffer: 3000,
                sources: ['mp4', 'webm']
            },
            options
        );

        if (this.el) {
            this.init();
        }
    }

    init() {
        this.addSources();

        this.initPlayer();

        // Loading kick off
        this.load();
    }

    addSources() {
        var fragment = document.createDocumentFragment();

        const sourceHtml = this.settings.sources.forEach(source => {
            let src = this.el.getAttribute(`data-bgvideo-source-${source}`);

            let sourceEl = document.createElement('source');
            sourceEl.setAttribute('type', `video/${source}`);
            sourceEl.setAttribute('src', src);
            fragment.appendChild(sourceEl);
        });

        this.el.querySelector('video').appendChild(fragment);
    }

    load() {
        this.player.startBuffering();

        delay(this.settings.videoLoadTimeout).then(() => {
            // Video already active so don't do anything...
            if (this.videoIsDirty || this.player.isPlaying) {
                return;
            }

            this.videoIsDirty = true; // video took too long so mark as "dirty"

            // ...and unload the video to cancel further download
            this.player.destroyVideo();
            this.player.destroyControls();
        });
    }

    initPlayer() {
        var _this = this;

        this.player = new VideoPlayer(this.el, {
            onResize(playerInstance) {
                _this.objectFitVideo();
            },
            onProgress(playerInstance) {
                _this.videoReady(playerInstance);
            },
            onLoadedMetaData(playerInstance) {
                _this.videoReady(playerInstance);
            }
        });
    }

    videoReady(playerInstance) {
        var _this = this;
        if (
            !_this.videoIsDirty &&
            playerInstance.bufferPos() > _this.settings.requiredBuffer / 1000
        ) {
            // if we've buffered X seconds of video
            playerInstance.start();
            _this.videoIsDirty = true;
        }
    }
}

// Apply Mixins
applyMixins(BackgroundVideo, objectFitVideo);

export default BackgroundVideo;
