// import 'package:flutter/material.dart';
// import 'package:vnpay_flutter/vnpay_flutter.dart';
//
// class PaymentScreen extends StatefulWidget{
//   @override
//   _PaymentScreenState createState() => _PaymentScreenState();
// }
//
// class _PaymentScreenState extends State<PaymentScreen>{
//   int quantity = 0;
//   String qrCode = '';
//
//   void generateQRCode() async{
//
//     setState(() {
//       qrCode = 'QR';
//     });
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text('Thanh toán'),
//       ),
//       body: Padding(
//         padding: const EdgeInsets.all(16.0),
//         child: Column(
//           children: [
//             TextField(
//               keyboardType: TextInputType.number,
//               onChanged: (value) {
//                 setState(() {
//                   quantity = int.tryParse(value) ?? 0;
//                 });
//               },
//               decoration: InputDecoration(
//                 labelText: 'Số lượng',
//               ),
//             ),
//             ElevatedButton(
//               onPressed: generateQRCode,
//               child: Text('Tính tiền'),
//             ),
//             if (qrCode.isNotEmpty)
//               QrImage(
//                 data: qrCode,
//                 version: QrVersions.auto,
//                 size: 200.0,
//               ),
//           ],
//         ),
//       ),
//     );
//   }
// }
//
