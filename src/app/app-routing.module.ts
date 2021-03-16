import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 's-trips', loadChildren: './s-trips/s-trips.module#STripsPageModule' },
  { path: 'checklist', loadChildren: './checklist/checklist.module#ChecklistPageModule' },
  { path: 'sign/:id', loadChildren: './sign/sign.module#SignPageModule' },
  {
    path: 'punch-out/:id', 
    loadChildren: './punch-out/punch-out.module#PunchOutPageModule' 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule'},
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
