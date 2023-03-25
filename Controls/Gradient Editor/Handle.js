export default function(opts) {
	this.colour = opts.colour;
	this.step;

	let handle;
	let colourInput;
	let wrapper;
	let input;

	let self = this;
	let openPicker;

	this.isDraggable = function () {
		return opts.draggable;
	};

	this.getHTML = function () {
		return handle;
	};

	this.getInputValue = function () {
		return input.value;
	};

	function createHTML() {
		handle = document.createElement("div");
		handle.classList.add("handle");
		handle.draggable = false;

		colourInput = document.createElement("input");
		colourInput.classList.add("handleColour");
		colourInput.value = self.colour;
		colourInput.type = "color";
		handle.appendChild(colourInput);

		wrapper = document.createElement("label");
		wrapper.classList.add("handleWrapperInput");
		handle.appendChild(wrapper);

		input = document.createElement("input");
		input.draggable = false;
		input.classList.add("handleInput");
		input.type = "number";
		wrapper.appendChild(input);
	}

	function setupHandleListeners() {
		if (self.isDraggable())
			handle.onmousedown = (event) => {
				switch (event.button) {
					case 0:
						opts.parent.startDrag(self);
						break;
				}
			};

		handle.onmouseup = (event) => {
			switch (event.button) {
				case 0:
					const dragging = opts.parent.getDragging();
					openPicker =
						(!!dragging &&
							dragging.handle === self &&
							dragging.startValue === input.value) ||
						!self.isDraggable();
					break;
			}
		};

		colourInput.onclick = (event) => {
			if (!openPicker)
        event.preventDefault();
		};

		handle.oncontextmenu = (event) => {
			if (self.isDraggable())
        opts.parent.removeHandle(self);

			event.preventDefault();
		};

		colourInput.oninput = () => {
			self.colour = colourInput.value;

			opts.parent.draw();
		};

		document.addEventListener("mousemove", (event) => {
			const dragging = opts.parent.getDragging();

			if (!dragging || dragging.handle != self)
        return;

			const rect = opts.parent.getRect();
			const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);

			setStepValue(Math.round(x / rect.width / 0.01) * 0.01);

			opts.parent.draw();
		});

		document.addEventListener("mouseup", (event) => {
			switch (event.button) {
				case 0:
					const dragging = opts.parent.getDragging();

					if (!dragging || dragging.handle != self)
            return;

					parent.stopDrag();
			}
		});
	}

	function setupInputListeners() {
		input.onchange = () => {
			setStepValue(Math.min(Math.max(Math.round(input.value) / 100, 0), 1));
			opts.parent.draw();
		};

		input.onfocus = () => {
			if (!self.isDraggable())
        input.blur();
		};

		input.onmousedown = (event) => {
			input.focus();
			event.stopPropagation();
		};

		input.oncontextmenu = (event) => {
			event.stopPropagation();
		};

		input.onkeydown = (e) => {
			if (e.keyCode === 13)
        input.blur();
		};
	}

	function setStepValue(value) {
		self.step = parseFloat(value).toFixed(2);
		input.value = parseFloat(self.step * 100).toFixed(0);
	}

	this.draw = function () {
		handle.style.left = `${opts.leftOffset + this.step * opts.parent.getRect().width}px`;
	};
	
	createHTML();
	setupHandleListeners();
	setupInputListeners();
	setStepValue(opts.step);

	return this;
}