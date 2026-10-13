import { asset } from '$app/paths';

const BEEP_DURATION_MS = 2000;

/**
 * Plays the horn sound. Browsers only allow audio after a user interaction, so the player stays
 * silent until `enable()` was called from a click handler.
 */
export class BeepPlayer {
	active = $state(false);
	#audio = new Audio(asset('audio/beep.mp3'));
	#unlocked = false;

	/** Unlocks audio playback on the first user interaction and turns the sound on. */
	enable() {
		if (this.#unlocked) return;
		this.#unlocked = true;
		this.active = true;
		this.#play();
		this.#stop();
	}

	toggle() {
		this.active = !this.active;
	}

	beep() {
		if (!this.active) return;
		this.#play();
		setTimeout(() => this.#stop(), BEEP_DURATION_MS);
	}

	#play() {
		// Rejected when the browser blocks autoplay; nothing to do about that.
		this.#audio.play().catch(() => {});
	}

	#stop() {
		this.#audio.pause();
		this.#audio.load();
	}
}
