import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityComponent } from './component/activity/activity.component';
import { McqComponent } from './component/activity/mcq/mcq.component';
import { VaultComponent } from './component/activity/vault/vault.component';

import {SoundService} from './service/sound.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ActivityComponent, McqComponent, VaultComponent],
  providers: [SoundService]
})
export class QuizModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: QuizModule,
      providers: []
    };
  }


}
