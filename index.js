const WebSocket = require("ws");
let options = {
  "ws": "wss://ourworldofpixels.com",
  "world": "owop",
  "captchapass": "",
};
let player = {
  send: (m) => {
    bot.send(m + "\n");
  },
  message: (m) => {},
  draw: (x, y, r) => {
    let dv = new DataView(new ArrayBuffer(11));
    dv.setInt32(0, x, true);
    dv.setInt32(4, y, true);
    dv.setUint8(8, r[0]);
    dv.setUint8(9, r[1]);
    dv.setUint8(10, r[2]);
    bot.send(dv.buffer);
  },
  join: (w) => {
    let ints = [];
    w = w.toLowerCase();
    for (let i = 0; i < w.length && i < 24; i++) {
      let charCode = w.charCodeAt(i);
      if ((charCode < 123 && charCode > 96) || (charCode < 58 && charCode > 47) || charCode === 95 || charCode === 46) ints.push(charCode);
    }
    let array = new ArrayBuffer(ints.length + 2);
    let dv = new DataView(array);
    for (let i = ints.length; i--;) dv.setUint8(i, ints[i]);
    dv.setUint16(ints.length, 25565, true);
    bot.send(array);
  },
  leave: () => {
    bot.close();
  },
  move: (x, y, r, t) => {
    let dv = new DataView(new ArrayBuffer(12));
    dv.setInt32(0, x * 16, true);
    dv.setInt32(4, y * 16, true);
    dv.setUint8(8, r[0]);
    dv.setUint8(9, r[1]);
    dv.setUint8(10, r[2]);
    dv.setUint8(11, t);
    bot.send(dv.buffer);
  },
};
let bot = new WebSocket(options.ws);
bot.binaryType = "arraybuffer";
bot.onopen = () => {
  console.log("Connected");
};
bot.onclose = () => {
  console.log("Disconnected");
};
bot.onerror = e => {
  console.error("Error: " + e.data);
};
bot.onmessage = e => {
  if(typeof e.data == "string") {
    console.log(e.data);
    player.message(e.data);
  };
  if(typeof e.data == "object") {
  let data = new DataView(e.data);
  const opcode = data.getUint8(0);
  if(opcode == 0) {
    console.log("Id: " + data.getUint8(1));
  };
  if(opcode == 5) {
    let status = data.getUint8(1);
    switch(status) {
        case 0:
          console.log("Captcha Waiting");
          bot.send("25565LETMEINPLZ" + captchapass);
          break;
        case 1:
          console.log("Captcha Verifying");
          break;
        case 2:
          console.log("Captcha Verified");
          break;
        case 3:
          console.log("Captcha Ok");
          player.join(options.world);
          break;
        case 4:
          console.log("Captcha Invalid");
          break;
    };
  };
  };
};
