# Smart Cart Checkout

In modern supermarkets, manual billing causes long queues and increases customer waiting time. Existing smart trolley systems mainly rely on RFID or barcode scanning, which may lead to billing errors when scanned and placed items do not match. This project proposes an Automated Smart Trolley with Secured Dual-Layer Billing using multiple sensors for accurate billing. The system uses an RFID/barcode scanner, a camera module, and a load cell to verify item identity, appearance, and weight. An audio alert is generated if any mismatch is detected before billing is updated. Payment is completed using a QR code, followed by exit-level verification of item count and weight. This system reduces billing errors, prevents item swapping, and improves shopping efficiency in large retail stores.

Problem statement : Manual billing in supermarkets causes long queues and increased customer waiting time.

Existing smart trolley systems rely mainly on RFID or barcode scanning, which can lead to billing errors.

Item mismatch occurs when the scanned item is different from the item placed in the trolley.

Such mismatches result in incorrect billing and inventory loss.

There is a need for a secure automated billing system with proper verification and exit-level checking.

Proposed Methodology : Each smart trolley is equipped with an RFID reader or barcode scanner to identify items placed by the customer.

A camera module is used to visually verify whether the scanned item matches the actual item placed in the trolley.

A load cell (weight sensor) measures the weight of items to confirm their physical presence.

Ultrasonic and IR sensors detect item movement and automatically trigger the scanning and verification process.

If the scanned item and placed item do not match, the system generates an audio alert and blocks billing.

Billing is updated only when item identity, visual verification, and weight confirmation all match correctly.

After shopping, the customer completes payment using a QR code–based digital payment system.

At the exit, store staff verify the total item count and total weight; if mismatched, manual checking is done, otherwise exit is allowed.

Design me the application that we have connected the camera,nodemcu,piezo buzzer,weight sensor,barcode scanner,OLED display

1.Coming to the architecture, camera is placed on the top of the trolley so that it will capture the images for every second.

2. Node MCU/Arduino will connect the components that is for communication between the devices.

3.Weight sensor is placed on the base of the trolley  so that it will measure the weight of the trolley.

4.Barcode scanner is placed at the handle of the trolley. So that customer will scan the items and places in the trolley.

5.OLED display is also placed at the handle of the trolley so that customer can see the products if they can add/remove.

6.Piezo buzzer is placed in the trolley because if any mismatches occurs it will alert.

Coming to my problem statement, Barcode reader is used to scan the items. After scanning it should display the items weight,cost and at the right side it should display the minus, quantity and the plus button to remove or add the items. And in the display it should add the total weight of the trolley. Camera is used because if one item is scanned but another item is placed in the trolley. so that camera will contionously capture the images. If the above condition occurs it will alert the users/staff otherwise it will stay silent. The weight sensor is used to check the trolley weight and the barcode scanned items weight. After completion of shopping it will check whether the weight of the scanned items matches the weight of the trolley.If match then QR code is generated to pay the amount through phonepay,gpay,paytm else not displayed. They must correct the faults they have done.

So design me the project for the above content. The trolley displayed must be connected with the above sensors

Generate me the best mobile UI that must be attractive to the users
The slots that i want to have in proper is like follows
1. At left corner - Barcode Scanner
2.Down of barcode scanner - Camera capturing images for every second
3. In the middle - The dashboard
4.Right side parallel to barcode scanner - Weight of the trolley and the weight of the scanned items
5.Right side parallel to camera - QR Code display

The UI is ok but if the scanned item and placed item is mismatched then alerts sound should produce, and if the weights of the scanned items and weight of the trolley is mismatched we should show  that case too , 1. Simulate mismatch 2.Stop Alert to both the camera and weight...and also when clicking on phonepe, gpay,paytm it must pay and it should give the transaction complete message and transaction id. And the scanned item should buzzer sound that the item is scanned , after successful transaction also. Keep same UI but add this modifications And the trolley weight is initially 0.


Same but don't give me scrollable it must be fix with one screen only like the above

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0414dcd5-df49-44e7-b68e-950261bc4483).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
