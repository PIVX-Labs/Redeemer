
var url = 'https://explorer.duddino.com';

var calculatefee = function (bytes) {
  // TEMPORARY: Hardcoded fee per-byte
  fee = Number(((bytes * 250) / 100000000).toFixed(8)); // 250 sats/byte
}