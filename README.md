# Thực hành Blockchain DominionDAO

Source Solidity và React Web3 của Trần Đức Cường, B23DCTC019.

## Thông tin triển khai

- Ethereum Sepolia, chain ID 11155111.
- DominionDAO: `0x80b057bfe10c22f5FCd61652cCb8d8b1085a9467`.
- Tổng đóng góp từ 0,01 ETH cấp quyền Stakeholder. Mỗi tài khoản có một phiếu cho mỗi đề xuất.
- Thời hạn biểu quyết 5 phút. Phiếu đồng ý phải nhiều hơn phiếu từ chối.

## Chạy giao diện

Cài Node.js 22, mở PowerShell tại thư mục đã giải nén và chạy lần lượt:

```powershell
cd web3-app
npm.cmd ci --legacy-peer-deps
Copy-Item .env.example .env
npm.cmd start
```

Mở http://localhost:3000 bằng trình duyệt có MetaMask, chọn Sepolia và kết nối ví. React dùng contract đã deploy, không cần private key trong source.

## Compile và deploy contract riêng

Mở PowerShell tại thư mục gốc:

```powershell
cd smartcontract
npm.cmd ci --legacy-peer-deps
Copy-Item .env.example .env
```

Điền RPC URL Sepolia và private key của ví thực hành vào .env tại máy, rồi chạy:

```powershell
npx.cmd hardhat compile
npx.cmd hardhat run scripts/deploy-dao.js --network sepolia
```

Nếu deploy mới, cập nhật địa chỉ trong web3-app/.env, chép ABI từ smartcontract/artifacts/contracts/DominionDAO.sol/DominionDAO.json vào web3-app/src/abis/DominionDAO.json rồi khởi động lại React.

## Báo cáo

Báo cáo buổi 2 nằm trong docs/. Báo cáo có sẵn trong dự án được giữ ở thư mục gốc.

## Giới hạn

Giao diện chờ hết thời hạn mới hiện Payout, nhưng contract mẫu chưa kiểm tra thời hạn trong payBeneficiary. Đây là bài thực hành testnet, chưa được kiểm toán cho tiền thật.

Private key, .env riêng, node_modules và kết quả build/cache không được đưa lên Git. Các file .env.example cung cấp cấu hình để chạy lại. Thư viện cũ có thể tạo cảnh báo source map và deprecated khi biên dịch.
