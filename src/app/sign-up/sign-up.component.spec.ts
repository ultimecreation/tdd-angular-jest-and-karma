import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('SignUpComponent', () => {
    let component: SignUpComponent;
    let fixture: ComponentFixture<SignUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignUpComponent,],
            imports: [HttpClientTestingModule, SharedModule, ReactiveFormsModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SignUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    describe('Layout', () => {
        it('has signup Header', () => {
            const signUp = fixture.nativeElement
            const h1 = signUp.querySelector('h1')
            expect(h1.textContent).toBe('Sign up')
        });

        it('has username input', () => {
            const signup = fixture.nativeElement as HTMLElement
            const label = signup.querySelector('label[for="username"]')
            const input = signup.querySelector('input[id="username')
            expect(label).toBeTruthy()
            expect(label?.textContent).toBe('Username')
            expect(input).toBeTruthy()
        })
        it('has email input', () => {
            const signup = fixture.nativeElement as HTMLElement
            const label = signup.querySelector('label[for="email"]')
            const input = signup.querySelector('input[id="email"]')
            expect(label).toBeTruthy()
            expect(label?.textContent).toBe('Email')
            expect(input).toBeTruthy()

        })
        it('has password input', () => {
            const signup = fixture.nativeElement as HTMLElement
            const label = signup.querySelector('label[for="password"]')
            const input = signup.querySelector('input[id="password"]')
            expect(label).toBeTruthy()
            expect(label?.textContent).toBe('Password')
            expect(input).toBeTruthy()

        })
        it('has password type for password input', () => {
            const signup = fixture.nativeElement as HTMLElement

            const input = signup.querySelector('input[id="password"]') as HTMLInputElement
            expect(input.type).toBe('password')

        })


        it('has passwordRepeat input', () => {
            const signup = fixture.nativeElement as HTMLElement
            const label = signup.querySelector('label[for="passwordRepeat"]')
            const input = signup.querySelector('input[id="passwordRepeat"]')
            expect(label).toBeTruthy()
            expect(label?.textContent).toBe('Password Repeat')
            expect(input).toBeTruthy()

        })
        it('has password type for passwordRepeat input', () => {
            const signup = fixture.nativeElement as HTMLElement

            const input = signup.querySelector('input[id="passwordRepeat"]') as HTMLInputElement
            expect(input.type).toBe('password')

        })


        it('has signup Button', () => {
            const signUp = fixture.nativeElement
            const signUpBtn = signUp.querySelector('button')
            expect(signUpBtn.textContent).toMatch(/Sign up/i)
        });


        it('has button disabled at start', () => {
            const signUp = fixture.nativeElement
            const signUpBtn = signUp.querySelector('button')
            expect(signUpBtn.disabled).toBeTruthy()
        })

    })

    describe('Interactions', () => {
        let button: any
        let signup: HTMLElement
        let httpTestingController: HttpTestingController

        const setupForm = async () => {
            httpTestingController = TestBed.inject(HttpTestingController)
            signup = fixture.nativeElement as HTMLElement

            await fixture.whenStable()

            const usernameInput = signup.querySelector('input[id="username"]') as HTMLInputElement
            const emailInput = signup.querySelector('input[id="email"]') as HTMLInputElement
            const passwordInput = signup.querySelector('input[id="password"]') as HTMLInputElement
            const passwordRepeatInput = signup.querySelector('input[id="passwordRepeat"]') as HTMLInputElement

            usernameInput.value = "My username"
            usernameInput.dispatchEvent(new Event('input'))
            emailInput.value = 'test@mail.com'
            emailInput.dispatchEvent(new Event('input'))
            emailInput.dispatchEvent(new Event('blur'))
            passwordInput.value = "Password"
            passwordInput.dispatchEvent(new Event('input'))
            passwordRepeatInput.value = "Password"
            passwordRepeatInput.dispatchEvent(new Event('input'))

            fixture.detectChanges()
            button = signup.querySelector('button')
        }
        it('enables the button when the password and password-repeat fields are filled', async () => {
            await setupForm()
            expect(button?.disabled).toBeFalsy()
        })
        it('send username,email,password to the backend on form submission', async () => {
            await setupForm();
            fixture.detectChanges();
            button?.click();
            const req = httpTestingController.expectOne("/api/1.0/users");
            const requestBody = req.request.body;
            expect(requestBody).toEqual({
                username: "My username",
                password: "Password",
                email: "test@mail.com"
            })
        })

        it('disables button when form is submitted', async () => {
            await setupForm()
            button.click()
            fixture.detectChanges()
            button.click()
            httpTestingController.expectOne("/api/1.0/users")
            expect(button?.disabled).toBeTruthy()
        })

        it('displays spinner when api request is send', async () => {
            await setupForm()
            button.click()
            fixture.detectChanges()
            expect(signup.querySelector('span[role="status"]')).toBeTruthy()
        })

        it('does displays spinner when no api request is send', async () => {
            await setupForm()
            expect(signup.querySelector('span[role="status"]')).toBeFalsy()
        })

        it('displays signup success notification on registration success', async () => {
            await setupForm()

            expect(signup.querySelector('.alert-success')).toBeFalsy()
            button.click()
            const req = httpTestingController.expectOne("/api/1.0/users")
            req.flush({})
            fixture.detectChanges()
            const msg = signup.querySelector('.alert-success')
            expect(msg?.textContent).toContain('Please check your email to activate your account')
        })

        it('hides the form on registration success', async () => {

            await setupForm()

            expect(signup.querySelector('form')).toBeTruthy()

            button.click()
            const req = httpTestingController.expectOne("/api/1.0/users")
            req.flush({})
            fixture.detectChanges()

            expect(signup.querySelector('form')).toBeFalsy()
        })

        it('displays validation error from backend after submit failure', async () => {
            await setupForm()

            expect(signup.querySelector('form')).toBeTruthy()

            button.click()
            const req = httpTestingController.expectOne("/api/1.0/users")
            req.flush({
                validationErrors: { email: "Email in use" }
            }, {
                status: 400,
                statusText: "Bad Request"
            })
            fixture.detectChanges()

            const validationElement = signup.querySelector(`div[data-testid="email-validation"]`)
            expect(validationElement?.textContent).toContain("Email in use")
        })
    })

    describe('Validation', () => {
        const testCases = [
            { field: 'username', value: '', error: 'Username is required' },
            { field: 'username', value: '123', error: 'Username must be at least 4 characters' },
            { field: 'email', value: '', error: 'Email is required' },
            { field: 'email', value: 'invalid-format', error: 'Invalid email address' },
            { field: 'password', value: '', error: 'Password is required' },
            { field: 'passwordRepeat', value: 'pass', error: 'Passwords do not match' },
        ]

        testCases.forEach(({ field, value, error }) => {
            it(`displays ${error} when ${field} has '${value}'`, () => {
                const signup = fixture.nativeElement as HTMLElement
                expect(signup.querySelector(`div[data-testid="${field}-validation"]`)).toBeNull()

                const input = signup.querySelector(`input[id="${field}"]`) as HTMLInputElement
                input.value = value
                input.dispatchEvent(new Event('input'))
                input.dispatchEvent(new Event('blur'))

                fixture.detectChanges()

                const validationElement = signup.querySelector(`div[data-testid="${field}-validation"]`)
                expect(validationElement?.textContent).toContain(error)
            })
        })

        it(`displays Email in use when email is already taken`, () => {
            let httpTestingController = TestBed.inject(HttpTestingController)
            const signup = fixture.nativeElement as HTMLElement
            expect(signup.querySelector(`div[data-testid="email-validation"]`)).toBeNull()

            const input = signup.querySelector(`input[id="email"]`) as HTMLInputElement
            input.value = "non-unique-email@mail.com"
            input.dispatchEvent(new Event('input'))
            input.dispatchEvent(new Event('blur'))
            const request = httpTestingController.expectOne(({ url, method, body }) => {
                if (url === "/api/1.0/user/email" && method === "POST") {
                    return body.email === "non-unique-email@mail.com"
                }
                return false
            })

            request.flush({})
            fixture.detectChanges()

            const validationElement = signup.querySelector(`div[data-testid="email-validation"]`)
            expect(validationElement?.textContent).toContain("Email in use")
        })


    })
});
