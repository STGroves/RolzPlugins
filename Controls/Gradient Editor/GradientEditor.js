import GradientUtilities from "./GradientUtilities.js";
import Handle from "./Handle.js";

export default function (opts) {
	let handles = [];
	let self = this;

	let visible = opts.visible;

	let elem;
	let ctx;

	let dragging;

	this.getRect = function () {
		return elem.getBoundingClientRect();
	};

	this.getDragging = function () {
		return dragging;
	};

	this.getHTML = function () {
		return elem;
	}
	
	Object.defineProperty(self, "Visible", {
		get: function () { return visible; },
		set: function (value) {
			visible = value;

    	if (visible) {
      	updateCanvasSize();
				self.draw();
			}
		}
	});


	function createHTML() {
		elem = document.createElement("canvas");
		ctx = elem.getContext("2d");

		elem.classList.add("gradientBackground");
		updateCanvasSize();

		opts.parent.appendChild(elem);
	}

	function updateCanvasSize() {
		const rect = opts.parent.getBoundingClientRect();

		elem.width = rect.width - opts.handleInputWidth;
		elem.height = opts.editorHeight - (opts.handleBorder * 4);
	}

	this.load = function (cssText) {
		while (handles.length > 0) this.removeHandle(handles[0]);

		const matchedText = cssText
			.match(/background: [^;]+;/)[0]
			.replace("background: ", "")
			.slice(0, -1);

		if (matchedText[matchedText.length - 1] !== ")") {
			addHandle(0, matchedText, false);
			this.draw();
			
			return;
		}

		const stops = matchedText
			.slice(0, -1)
			.match(/rgb\([0-9]{1,3}, {0,1}[0-9]{1,3}, {0,1}[0-9]{1,3}\) [0-9]{1,3}%/gm);

		stops.forEach((x) => {
			const editedText = x.replaceAll(", ", ",");
			const parts = editedText.split(" ");

			const colour = GradientUtilities.rgbToHex(
				...parts[0].replace("rgb(", "").replace(")", "").split(",")
			);
			const step = Number(parts[1].slice(0, -1)) / 100;

			addHandle(step, colour, step > 0);
		});

		this.draw();
	};

	function addHandle(step, colour, draggable = true) {
		const handle = new Handle({
			parent: self,
			step: step,
			colour: colour,
			draggable: draggable,
			leftOffset: (opts.handleInputWidth - opts.handleWidth) / 2
		});
		elem.parentElement.appendChild(handle.getHTML());
		handles.push(handle);

		self.draw();
	}

	this.removeHandle = function (handle) {
		handles.splice(
			handles.findIndex((x) => x === handle),
			1
		);
		handle.getHTML().remove();

		self.draw();
	};

	function setupListeners() {
		document.addEventListener("mouseup", () => {
			self.stopDrag();
		});

		window.addEventListener("resize", () => {
			updateCanvasSize();
			self.draw();
		});

		elem.onmouseup = (event) => {
			switch (event.button) {
				case 0:
					const rect = self.getRect();
					const x = event.clientX - rect.left;

					const colour = ctx.getImageData(x, 0, 1, 1).data;

					addHandle(x / rect.width, GradientUtilities.rgbToHex(...colour));
					self.draw();

					break;
			}
		};
	}

	this.startDrag = function (target) {
		if (dragging !== undefined) return;

		dragging = {
			handle: target,
			startValue: target.getInputValue()
		};
	};

	this.stopDrag = function () {
		dragging = undefined;
	};

	this.draw = function () {
		if (!visible) return;

		const gradient = ctx.createLinearGradient(0, 0, elem.width, 0);
		let gradientCSS = "";
		
		if (handles.length === 1) {
			gradient.addColorStop(0, handles[0].colour);
			
			gradientCSS = handles[0].colour;
		} else {
			gradientCSS = "linear-gradient(to right"
			handles.sort((a, b) => {
				return a.step - b.step;
			});

			handles.forEach((x) => {
				const step = parseFloat(x.step * 100).toFixed(0);
				gradientCSS += `, ${x.colour} ${step}%`;

				gradient.addColorStop(x.step, x.colour);

				x.draw();
			});
			
			gradientCSS += ")";
		}

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, elem.width, elem.height);
		
		elem.dispatchEvent(new CustomEvent("draw", {detail: gradientCSS}));
	};

	GradientUtilities.setCSSVariable("--inset", `${opts.handleInputWidth / 2}px`);
	GradientUtilities.setCSSVariable("--editor-height", `${opts.editorHeight}px`);
	GradientUtilities.setCSSVariable("--handle-border", `${opts.handleBorder}px`);
	GradientUtilities.setCSSVariable("--handle-input-width", `${opts.handleInputWidth}px`);
	GradientUtilities.setCSSVariable("--handle-width", `${opts.handleWidth}px`);
	
	createHTML();
	setupListeners();
	addHandle(0, "#FF0000", false);
	addHandle(1, "#0000FF");

	return this;
}