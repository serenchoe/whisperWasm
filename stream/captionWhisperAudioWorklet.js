class CaptionsWhisperPcmProcessor extends AudioWorkletProcessor {
    constructor() {
        super(...arguments);
        this.buffer = null;
        this.bufferOffset = 0;
    }
    // 2D array due to WebAudio API supporting multiple channels, but we only will be using one (the first/0th channel)
    floatTo16BitPCM(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return int16Array.buffer;
    }
    // process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
    //   const input = inputs[0][0];
    //   const chunkSize = parameters.chunkSize[0];
    //   console.log('input size : ' + input.length);
    //   console.log('chunkSize : ' + chunkSize);
    //   try {
    //     // as inputs are received, fill the buffer. Once the buffer is full, convert to 16 bit PCM, send
    //     // back to main thread, and reinitialize buffer
    //     for (let i = 0; i < input.length; i++) {
    //       if (!this.buffer || this.bufferOffset === chunkSize) {
    //         // buffer is full, send and reinitialize
    //         if (this.buffer) {
    //           const resultBuffer = this.floatTo16BitPCM(this.buffer);
    //           this.port.postMessage({ chunk: resultBuffer });
    //         }
    //         this.buffer = new Float32Array(chunkSize);
    //         this.bufferOffset = 0;
    //       }
    //       this.buffer[this.bufferOffset++] = input[i];
    //     }
    //   } catch (error) {
    //     this.port.postMessage({ error });
    //     this.buffer = null;
    //   }
    //   return true;
    // }
    process(inputs, outputs, parameters) {
        const input = inputs[0][0];
        const chunkSize = parameters.chunkSize[0];
        // console.log('input size : ' + input.length);
        // console.log('chunkSize : ' + chunkSize);
        // console.log('inputs length : ' + inputs.length);
        // console.log('inputs[0] length : ' + inputs[0].length);
        // console.log('inputs[0][0] length : ' + inputs[0][0].length);
        try {
            if (input) {
                // console.log('input received : ' + input.length);
                // for (let i = 0; i < 16; i++) {
                //   console.log(i + ' : ' + input[i]);
                // }
                // console.log('input length : ' + input.length);
                // console.log('bufferOffset : ' + this.bufferOffset);
                if (!this.buffer) {
                    this.buffer = new Float32Array(chunkSize);
                    this.bufferOffset = 0;
                }
                this.buffer.set(input, this.bufferOffset);
                this.bufferOffset = this.bufferOffset + input.length;
                if (this.bufferOffset === chunkSize) {
                    // console.log('full!!');
                    // console.log('chunk size sent : ' + chunkSize);
                    // for (let i = 0; i < 16; i++) {
                    //   console.log(i + ' : ' + this.buffer[i]);
                    // }
                    this.port.postMessage({ chunk: this.buffer });
                    this.buffer = null;
                }
            }
        }
        catch (error) {
            this.port.postMessage({ error });
            this.buffer = null;
        }
        return true;
    }
}
CaptionsWhisperPcmProcessor.parameterDescriptors = [{ name: 'chunkSize', defaultValue: 4096 }];
registerProcessor('CaptionsWhisperPcmProcessor', CaptionsWhisperPcmProcessor);
export {};
