import { LoadingController, AlertController, ToastController } from 'ionic-angular';

export abstract class AbstractPage {

  constructor(
    private loadingCtrl: LoadingController,
    protected alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  protected loading(message: string) {
    const loading = this.loadingCtrl.create({
      content: message
    });
    loading.present();
    return loading;
  }

  protected toast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  protected alert(title: string, message: string) {
    const alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: ['Ok']
    });
    alert.present();
  }

}
