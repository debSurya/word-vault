import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivityComponent } from "./quiz/component/activity/activity.component";

const routes: Routes = [

  {
		path:'',
		redirectTo:'/quiz',
		pathMatch:'full'
	},{
		path:'quiz',
		component:ActivityComponent
	}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
