import { Component } from '@angular/core';
import { IonicPage, NavController, Platform, AlertController, Tabs } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Badge } from '@ionic-native/badge';
import { Response } from '@angular/http';

import { NavigationService } from '../../providers/navigation-service/navigation-service';
import { UserService } from '../../providers/user-service/user-service';

export class ActivityItem {
  activityID: string;
  userID: string;
  type: string;
  isRead: boolean;
  isNew: boolean;
  author: any;
  target: any;
  actor: any;
  commentID: string;
  time: string;
  timeAt: number;
}

//@IonicPage()
@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html',
})
export class ActivityPage {
  private activities: Array<ActivityItem>;
  public notificationsEnabled: boolean;

  constructor(
    private userService: UserService,
    private nav: NavController,
    private platform: Platform,
    private alertCtrl: AlertController,
    private diagnostic: Diagnostic,
    private badge: Badge) {
  }

  public onPageWillEnter = () => {
    this.fetch();
    this.badge.clear();
    if (this.platform.is('ios')) {
      this.diagnostic.isRemoteNotificationsEnabled().then((enabled) => {
        this.notificationsEnabled = enabled;
        console.log('Remote notifications are ' + (enabled ? 'enabled' : 'disabled'));

      }).catch(e => console.error(e));
    } else {
      this.notificationsEnabled = true;
    }
  }

  public dispatch(event, activity: ActivityItem) {
    event.stopPropagation();

    this.userService.markActivityAsRead(activity.activityID);

    switch (activity.type) {
      case 'N_FOLLOW':
        let userID = activity.actor.userID;
        NavigationService.goToProfile(this.nav, event, userID);
        break;
      case 'N_REPLY':
      case 'N_COMMENT':
        let postID = activity.target.Post.postID;
        NavigationService.openPost(this.nav, postID);
        break;
    }
  }

  fetch() {
    this.userService.getActivities()
      .subscribe((response: Response) => {
        this.activities = response.json().activities;
        this.userService.markActivityAsSeen();
      });
  }

  public createPost() {
    let tabs: Tabs = this.nav.parent;
    tabs.select(1);
  }

  public referSettings() {
    let settingsAlert = this.alertCtrl.create({
      title: 'Please go to your phone settings to turn on notification permissions',
      buttons: ['OK']
    });
    settingsAlert.present();
  }
}
