const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
canvas.willReadFrequently = true

const input = document.getElementById('file')
const label = document.querySelector('label')
const convertBtn = document.getElementById('convert-btn')

class App {
	constructor() {
		this.size = 2
		this.gap = 4
		this.mouseX = null
		this.mouseY = null
		this.distanceFactor = 50
		this.animationId = null
		this.particles = []
		this.image = new Image()
	}

	loadImage(e) {
		const file = e.target.files[0]

		if (!file) return

		cancelAnimationFrame(this.animationId)

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		const reader = new FileReader()
		reader.readAsDataURL(file)

		reader.onload = (eventReader) => {
			this.image.src = eventReader.target.result

			this.image.onload = () => {
				ctx.drawImage(this.image, canvas.width / 2 - this.image.width / 2, 0)
			}
		}

		label.style.display = 'none'
		convertBtn.style.display = 'block'
	}

	convert() {
		if (this.particles.length) {
			this.particles = []
		}

		label.style.display = 'block'
		convertBtn.style.display = 'none'

		const { data, width, height } = ctx.getImageData(
			canvas.width / 2 - this.image.width / 2,
			0,
			this.image.width,
			this.image.height
		)

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		if (this.particles.length) {
			this.particles = []
		}

		for (let y = 0; y < height; y += this.size + this.gap) {
			for (let x = 0; x < width; x += this.size + this.gap) {
				const pxIndex = (y * width + x) * 4

				const color = `rgba(${data[pxIndex]}, ${data[pxIndex + 1]}, ${
					data[pxIndex + 2]
				}, ${data[pxIndex + 3]})`

				const currentX = x + canvas.width / 2 - width / 2

				this.particles.push(new Particle(currentX, y, color, this.size))
			}
		}

		this.particles.forEach((particle) => {
			particle.draw(ctx)
		})

		this.animate()
	}

	update() {
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		this.particles.forEach((particle) => {
			const distance = Math.sqrt(
				(particle.x - this.mouseX) ** 2 + (particle.y - this.mouseY) ** 2
			)

			const angle = Math.atan2(
				particle.y - this.mouseY,
				particle.x - this.mouseX
			)

			if (distance < 50) {
				particle.x += Math.cos(angle) * this.distanceFactor
				particle.y += Math.sin(angle) * this.distanceFactor
			} else {
				particle.x += (particle.baseX - particle.x) * 0.03
				particle.y += (particle.baseY - particle.y) * 0.03
			}

			particle.draw(ctx)
		})
	}

	setMouse(e) {
		this.mouseX = e.clientX - canvas.getBoundingClientRect().left
		this.mouseY = e.clientY - canvas.getBoundingClientRect().top
	}

	animate() {
		this.animationId = requestAnimationFrame(this.animate.bind(this))
		this.update()
	}

	init() {
		this.addEventChangeInput(this)
		this.addEventMouseMove(this)
		this.addEventClickConvert(this)

		canvas.width = innerWidth
		canvas.height = innerHeight - 240
	}

	start() {
		this.init()
		this.animate()
	}

	addEventMouseMove() {
		document.addEventListener('mousemove', (e) => this.setMouse(e))
	}

	addEventClickConvert() {
		convertBtn.addEventListener('click', () => this.convert())
	}

	addEventChangeInput() {
		input.addEventListener('change', (e) => this.loadImage(e))
	}
}

class Particle {
	constructor(x, y, color, size) {
		this.x = x
		this.y = y
		this.baseX = x
		this.baseY = y
		this.color = color
		this.baseColor = color
		this.size = size
	}

	draw(ctx) {
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.size, 0, Math.PI + 2)
		ctx.closePath()
		ctx.fillStyle = this.color
		ctx.fill()
	}
}

const app = new App()

app.init()
