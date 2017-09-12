import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, AlertController, Events } from 'ionic-angular';
import { Response } from '@angular/http';

import { UserService } from '../../providers/user-service/user-service';
import { FindFriendsPage } from '../find-friends/find-friends';
import { InviteFriendsPage } from '../invite-friends/invite-friends';
import { PreferencesPage } from '../preferences/preferences';
import { MyFriendsPage } from '../my-friends/my-friends';
import { InterestsPage } from '../interests/interests';
import { MyPostsPage } from '../my-posts/my-posts';
import { EditProfileModalPage } from '../edit-profile-modal/edit-profile-modal';

//@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
private user: any = {
    interests: [],
    posts: [],
  };

  constructor(private nav: NavController,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private userService: UserService,
              private events: Events) {
    events.subscribe('user:updated', (dataArray) => {
      let updated = dataArray[0];
      if (updated) {
        this.user = Object.assign(this.user, updated);
      } else {
        this.getUserDetails();
      }
    });
  }

  onPageWillEnter() {
    this.getUserDetails();
  }

  editInterests() {
    this.nav.push(InterestsPage, { editMode: true });
  }

  editProfile() {
    this.modalCtrl.create(EditProfileModalPage, this.user).present();
  }

  viewPosts() {
    this.nav.push(MyPostsPage);
  }

  getUserDetails() {
    this.userService
      .getCurrentUser()
      .subscribe(
        (response: Response) => this.user = response.json(),
        () => {
          let failAlert = this.alertCtrl.create({
            title: 'Oops!',
            subTitle: 'Failed to fetch user details',
            buttons: ['OK']
          });
          failAlert.present();
        });
  }

  inviteFriends() {
    this.nav.push(InviteFriendsPage);
  }

  viewFriends() {
    this.nav.push(MyFriendsPage, { friendsList: this.user.friends });
  }

  editSettings() {
    this.nav.push(PreferencesPage, this.user);
  }

  findFriends() {
    this.nav.push(FindFriendsPage);
  }
}
