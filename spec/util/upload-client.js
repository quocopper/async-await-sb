'use strict'

const Promise = require('bluebird')
const crypto = require('crypto')
const http = require('http')
const url = require('url')
const {inspect} = require('util')

// Not VCHAR or WSP according to RFC 5234
const invalidQuoted = /[^\t\x20-\x7e]/

// Non-printables, ", and \
const escapeQuoted = /[^\x21\x23-\x5b\x5d-\x7e]/g

const safeBase64 = buffer =>
	buffer.toString('base64')
		.replace(/\//g, '_')
		.replace(/\+/g, '-')

const memoize = (object, name, getter) => {
	function getter_() {
		const value = getter.call(this)

		Object.defineProperty(this, name, {
			configurable: true,
			value,
		})

		return value
	}

	Object.defineProperty(object, name, {
		configurable: true,
		get: getter_,
	})
}

// Encodes according to RFC 5322
const quoteString = text => {
	if (invalidQuoted.test(text)) {
		throw new Error('String is not quotable')
	}

	return '"' + text.replace(escapeQuoted, '\\$&') + '"'
}

const readToEnd = stream =>
	new Promise((resolve, reject) => {
		const parts = []

		stream.on('error', reject)

		stream.on('data', part => {
			parts.push(part)
		})

		stream.on('end', () => {
			resolve(Buffer.concat(parts))
		})
	})

const readJSON = body =>
	JSON.parse(body.toString('utf8'))

const writeEmpty = request => {
	request.end()
}

const writeJSON = data => {
	const json = JSON.stringify(data)

	return request => {
		request.end(json)
	}
}

class MultipartForm {
	constructor() {
		this.files = []
		this._hash = crypto.createHash('sha512')
	}

	addFile(name, data, filename) {
		this.files.push({
			name,
			data,
			filename,
		})

		this._hash.update(data)
	}

	get headers() {
		return {
			'Content-Type': 'multipart/form-data; boundary=' + this.boundary,
		}
	}

	writeTo(stream) {
		const boundary = '--' + this.boundary

		this.files.forEach((file, i) => {
			stream.write(
				(i === 0 ? '' : '\r\n') + boundary + '\r\n' +
				'Content-Disposition: form-data; name=' + quoteString(file.name) + '; filename=' + quoteString(file.filename) + '\r\n' +
				'Content-Length: ' + file.data.length + '\r\n' +
				'Content-Type: application/octet-stream\r\n\r\n'
			)

			stream.write(file.data)
		})

		stream.end('\r\n' + boundary + '--')
	}
}

memoize(MultipartForm.prototype, 'boundary', function () {
	return safeBase64(this._hash.digest().slice(0, 15))
})

class Client {
	constructor(apiRoot, agent) {
		if (!apiRoot.endsWith('/')) {
			throw new Error('API root ' + inspect(apiRoot) + ' must end with a slash')
		}

		this.apiRoot = apiRoot
		this.agent = agent
	}

	request(method, path, headers, writer) {
		return new Promise((resolve, reject) => {
			const options = url.resolveObject(this.apiRoot, path)
			options.agent = this.agent
			options.headers = headers
			options.method = method

			const request = http.request(options)
			request.on('error', reject)
			request.on('response', response => {
				if (response.statusCode >= 200 && response.statusCode < 400) {
					resolve(readToEnd(response))
				} else {
					reject(new Error('Unexpected status ' + response.statusCode))
				}
			})

			writer(request)
		})
	}

	requestJSON(method, path, headers, writer) {
		const headers_ =
			Object.assign(
				{Accept: 'application/json'},
				headers
			)

		return this.request(method, path, headers_, writer)
			.then(readJSON)
	}
}

class ImporterClient extends Client {
	importSpreadsheet(typeId, container, sheetIndex, columnMap) {
		if (typeof typeId !== 'string') {
			throw new TypeError('Type id must be a string')
		}

		if (typeof container !== 'string') {
			throw new TypeError('Container id must be a string')
		}

		if (!Number.isSafeInteger(sheetIndex) || sheetIndex < 1) {
			throw new TypeError('Sheet index must be a positive integer')
		}

		return this.request(
			'POST',
			'importers/' +
				encodeURIComponent(typeId) + '/' +
				encodeURIComponent(container) + '/' +
				sheetIndex +
				'/column-map',
			{'Content-Type': 'application/json'},
			writeJSON({map: columnMap})
		)
			.then(response => {
				const responseText = response.toString('utf8')

				return responseText === 'Accepted' ?
					Promise.resolve() :
					Promise.reject(new Error('Unexpected response: ' + inspect(responseText)))
			})
	}
}

class UploadClient extends Client {
	upload(data, extension) {
		if (!(data instanceof Buffer)) {
			throw new TypeError('Data must be a buffer')
		}

		if (!this.validExtensions.has(extension)) {
			throw new Error('Extension must be one of ' + Array.from(this.validExtensions).join(', '))
		}

		return this.requestJSON('POST', 'uploads', {}, writeEmpty)
			.then(response => response.container)
			.tap(container => {
				const form = new MultipartForm()
				form.addFile('chunk', data, '0')

				return this.requestJSON(
					'POST',
					`uploads/${encodeURIComponent(container)}/upload`,
					form.headers,
					request => {
						form.writeTo(request)
					}
				)
			})
			.tap(container => {
				const form = {
					chunkList: ['0'],
					fileSize: data.length,
					fileName: 'file.xlsx',
				}

				return this.requestJSON(
					'POST',
					`uploads/${encodeURIComponent(container)}/finalize`,
					{'Content-Type': 'application/json'},
					writeJSON(form)
				)
			})
	}
}

UploadClient.prototype.validExtensions = new Set(['xlsx', 'zip'])

exports.ImporterClient = ImporterClient
exports.UploadClient = UploadClient
