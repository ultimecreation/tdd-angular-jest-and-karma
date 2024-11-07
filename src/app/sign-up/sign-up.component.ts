
import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { passwordsMatchValidator } from './passworMatch.validator';
import UniqueEmailValidator from './UniqueEmailValidator';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

    disabled = true
    form = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(4)]),
        email: new FormControl('', {
            validators: [Validators.required, Validators.email],
            asyncValidators: [
                this.uniqueEmailValidator.validate.bind(this.uniqueEmailValidator)
            ],
            updateOn: 'blur'
        }),
        password: new FormControl('', Validators.required),
        passwordRepeat: new FormControl('')
    }, {
        validators: passwordsMatchValidator
    })

    apiProgress = false
    signupSuccess = false
    constructor(private userService: UserService, private uniqueEmailValidator: UniqueEmailValidator) {

    }

    ngOnInit(): void {
    }
    get usernameError() {
        const field = this.form.get('username')
        if (field?.errors && (field.touched || field.dirty)) {
            if (field.errors['required']) {
                return "Username is required"
            } else return "Username must be at least 4 characters"
        }
        return
    }

    get emailError() {
        const field = this.form.get('email')

        if (field?.errors && (field.touched || field.dirty)) {
            if (field.errors['required']) {
                return "Email is required"
            }
            else if (field.errors['email']) {
                return "Invalid email address"
            }
            else if (field.errors['emailInUse']) {
                return "Email in use"
            }
            else if (field.errors['backend']) {
                return field.errors['backend']
            }
        }
        return
    }

    get passwordError() {
        const field = this.form.get('password')

        if (field?.errors && field.touched || field?.dirty) {
            if (field.errors?.['required']) {
                return "Password is required"
            }
        }
        return
    }

    get passwordRepeatError() {
        if (this.form.errors && (this.form.touched || this.form.dirty)) {
            if (this.form.errors['passwordsMatch']) {
                return "Passwords do not match"
            }
        }
        return
    }

    onClickSignup() {
        this.apiProgress = true
        const body = this.form.value
        delete body.passwordRepeat

        this.userService.signUp(body).subscribe({
            next: () => {
                this.apiProgress = false
                this.signupSuccess = true
            },
            error: (httpError: HttpErrorResponse) => {
                const emailValidationError = httpError.error.validationErrors.email
                this.form.get('email')?.setErrors({
                    backend: emailValidationError
                })
                this.apiProgress = false
                this.signupSuccess = false
            }
        })
    }
    isDisabled() {
        const isFormFullfilled = this.form.get('username')?.value
            && this.form.get('email')?.value
            && this.form.get('password')?.value
            && this.form.get('passwordRepeat')?.value
        const validationErrors = this.usernameError || this.emailError || this.passwordError || this.passwordRepeatError
        return (!isFormFullfilled || validationErrors) ? true : false
    }
}
