import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'MarketHub',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resizeOnFullScreen: true,
    },
  PushNotifications: {
    presentationOptions: ["badge", "sound", "alert"],
  },
  }
};


export default config;
