import { NgModule } from '@angular/core';
import { SignupComponent } from './components/signup.component';
import { SimpleSignupComponent } from './components/simple-signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@NgModule({
  declarations: [SignupComponent, SimpleSignupComponent],
  providers: [],
  imports: [ReactiveFormsModule, CommonModule],
  exports: [SignupComponent, SimpleSignupComponent],
})
export class SignupModule {}
