import {Injectable} from '@angular/core'
import {Events} from 'ionic-angular'
import {Push} from 'ionic-native'
import {Environment} from '../Environment'

@Injectable()
export class NotificationService {

  private pushNotification: any

  constructor(private events: Events) {}

  register() {

    try {
      this.pushNotification = Push.init({
        ios: { alert: 'true', badge: 'true', sound: 'true' },
        android: { senderID: Environment.SENDERID }
      })
      this.pushNotification.on('notification', (data) => {
        this.events.publish('notifications:receive', data)
      })
      this.pushNotification.on('registration', (data) => {
        this.events.publish('notifications:register', data)
      })
      this.pushNotification.on('error', (err) => {
        console.warn('failed to initialise notifications', err.message)
      })

    } catch (err) {
      console.warn('failed to initialise notifications', err)
    }
  }

  unregister() {
    try {
      this.pushNotification.off('notification')
      this.pushNotification.off('registration')
    } catch (err) {
      console.warn('failed to unregister notifications', err)
    }
  }

  setupOnLaunch() {
    try {
      Push.hasPermission().then((permissions) => {
        if (permissions.isEnabled) {
          this.register()
        }
      })
    } catch (err) {
      console.warn('failed to initialise notifications', err)
    }
  }

}
