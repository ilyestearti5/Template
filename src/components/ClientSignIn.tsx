import { useEffect, useMemo, useState } from "react";
import { Button } from "./Custom";
import { BRAND_COLOR } from "./utils";
import { EmptyComponent, Icon, Translate } from "@biqpod/app/ui/components";
import { motion, AnimatePresence } from "framer-motion";
import {
  execAction,
  isLoading,
  useAction,
  useEffectDelay,
} from "@biqpod/app/ui/hooks";
import { api, Customer } from "../api";
import { allIcons } from "@biqpod/app/ui/apis";
import { tw } from "@biqpod/app/ui/utils";
import { Breadcrumb } from "./Breadcrumb";
export const ClientSignIn = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const signupAction = useAction(
    "signup-account",
    async () => {
      if (!username) {
        setError("Username is required");
        return;
      }
      const usernameExp = /^[a-z0-9]{3,15}$/;
      if (!username.match(usernameExp)) {
        setError(
          "user name cannot have: spaces,uppercase,symbols (except dot)"
        );
        return;
      }
      if (!password) {
        setError("Password is required");
        return;
      }
      if (!firstname) {
        setError("Firstname is required");
        return;
      }
      if (!lastname) {
        setError("Lastname is required");
        return;
      }
      if (!phone) {
        setError("Phone is required");
        return;
      }
      if (!phone.match(/((\+[0-9]{1,5})|0)[0-9]{9}/gi)) {
        setError("Invalid phone number");
        return;
      }
      if (!email) {
        setError("Email is required");
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email.match(emailRegex)) {
        setError("Invalid email address");
        return;
      }
      if (password != confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      await api.account.create(username, password, {
        firstname,
        lastname,
        phone,
        email,
      });
      reset();
    },
    [username, password, confirmPassword, firstname, lastname, phone, email]
  );
  const loginAction = useAction(
    "login-account",
    async () => {
      if (!username) {
        setError("Username is required");
        return;
      }
      const usernameExp = /^[a-z0-9]{3,15}$/;
      if (!username.match(usernameExp)) {
        setError(
          "Username cannot have: Spaces , Uppercase , Symbols (except dot)"
        );
        return;
      }
      if (!password) {
        setError("Password is required");
        return;
      }
      await api.account.login(username, password);
      reset();
    },
    [username, password]
  );
  const changePasswordAction = useAction(
    "change-password",
    async () => {
      if (oldPassword && newPassword) {
        await api.account.changePassword(oldPassword, newPassword);
        setShowChangePasswordPopup(false);
      }
    },
    [oldPassword, newPassword]
  );
  const isLoginLoading = isLoading(loginAction);
  const isSignupLoading = isLoading(signupAction);
  const isChangingPassword = isLoading(changePasswordAction);
  const showcaseImages = useMemo(() => {
    return [
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184469/pexels-photo-3184469.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184463/pexels-photo-3184463.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3182749/pexels-photo-3182749.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800",
    ];
  }, []);
  const reset = () => {
    setFirstname("");
    setLastname("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setDeletePassword("");
    setUsername("");
    setEmail("");
  };
  const onSubmit = async () => {
    if (isLoginView) {
      await execAction("login-account");
    } else {
      await execAction("signup-account");
    }
  };
  const [checkUsername, setCheckusername] = useState<{ status: string } | null>(
    null
  );
  const checkingUsername = useAction(
    "check-username",
    async () => {
      const exists = await api.account.checkUsername(username);
      setCheckusername({
        status: exists ? "exists" : "not-exists",
      });
    },
    [username]
  );
  useEffectDelay(
    () => {
      if (username && !isLoginView) {
        execAction("check-username");
      }
    },
    [username, isLoginView],
    100
  );
  const [customer, setCustomer] = useState<Customer | null>(null);
  useEffect(() => {
    return api.account.onUserDetect((_, info) => {
      setCustomer(info || null);
    });
  }, []);
  const handleDeleteAccount = async () => {
    if (deletePassword) {
      await api.account.delete(deletePassword);
      setShowDeletePopup(false);
    }
  };

  const handleLogout = () => {
    api.account.logout();
    setShowLogoutConfirmation(false);
  };
  useEffect(() => {
    reset();
  }, [isLoginView]);
  return (
    <div className="relative flex flex-col w-full h-[100vh]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            label: customer ? "Account" : "Sign In",
            isTranslatable: true,
          },
        ]}
        className="w-full"
      />

      <div className="relative flex flex-1 justify-center md:justify-end items-center w-full">
        <img
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          src={
            "https://freepngimg.com/svg/image/design/125125-abstract-blue-background.svg"
          }
        />
        <motion.div
          className="z-[10] bg-white md:shadow-2xl mx-4 sm:mx-6 md:mr-8 lg:mr-16 xl:mr-24 md:ml-auto px-4 sm:px-6 py-4 sm:py-8 rounded-none md:rounded-xl w-full md:w-2/3 lg:w-3/5 xl:w-1/2 max-w-4xl max-md:h-full max-md:overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {customer ? (
            <div className="flex flex-col justify-start items-center mx-auto py-4 w-full min-h-full">
              <motion.div
                className="bg-transparent sm:bg-white sm:shadow-lg mb-6 p-4 sm:p-6 lg:p-8 rounded-none sm:rounded-xl w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {/* Header Section */}
                <div className="mb-6 sm:mb-8 text-center">
                  <motion.div
                    className="flex justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-3 sm:mb-4 rounded-full w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 font-bold text-white text-lg sm:text-xl lg:text-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {customer.firstname.charAt(0).toUpperCase()}
                    {customer.lastname.charAt(0).toUpperCase()}
                  </motion.div>
                  <motion.h1
                    className="mb-2 font-bold text-gray-900 text-xl sm:text-2xl lg:text-3xl text-center capitalize"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 }}
                  >
                    <Translate content="welcome" />, {customer.firstname}{" "}
                    {customer.lastname}
                  </motion.h1>
                  <motion.p
                    className="text-gray-600 text-base sm:text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    @{customer.username}
                  </motion.p>
                </div>

                {/* Account Status */}
                <motion.div
                  className="mb-4 sm:mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <div className="flex justify-center items-center gap-2 mb-3 sm:mb-4">
                    <Icon
                      icon={
                        customer.status === "accepted"
                          ? allIcons.solid.faCheckCircle
                          : customer.status === "pending"
                          ? allIcons.solid.faClock
                          : allIcons.solid.faXmarkCircle
                      }
                      iconClassName={
                        customer.status === "accepted"
                          ? "text-green-500"
                          : customer.status === "pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    />
                    <span
                      className={`font-semibold capitalize text-sm sm:text-base ${
                        customer.status === "accepted"
                          ? "text-green-700"
                          : customer.status === "pending"
                          ? "text-yellow-700"
                          : "text-red-700"
                      }`}
                    >
                      <Translate content={`Account ${customer.status}`} />
                    </span>
                  </div>
                  {customer.status === "pending" && (
                    <div className="bg-yellow-50 p-3 sm:p-4 border border-yellow-200 rounded-lg text-center">
                      <p className="text-yellow-800 text-xs sm:text-sm">
                        <Translate content="Your account is pending approval. You will be notified once it's reviewed." />
                      </p>
                    </div>
                  )}
                  {customer.status === "rejected" && (
                    <div className="bg-red-50 p-3 sm:p-4 border border-red-200 rounded-lg text-center">
                      <p className="text-red-800 text-xs sm:text-sm">
                        <Translate content="Your account has been rejected. Please contact support for more information." />
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Client Information Cards */}
                <div className="gap-3 sm:gap-4 lg:gap-6 xl:gap-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-6 sm:mb-8">
                  <motion.div
                    className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <h3 className="flex items-center gap-2 mb-3 sm:mb-4 font-semibold text-gray-900 text-sm sm:text-base">
                      <Icon
                        icon={allIcons.solid.faUser}
                        iconClassName="text-blue-500"
                      />
                      <Translate content="Personal Information" />
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="First Name" />:
                        </span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm capitalize">
                          {customer.firstname}
                        </span>
                      </div>
                      <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="Last Name" />:
                        </span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm capitalize">
                          {customer.lastname}
                        </span>
                      </div>
                      <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="Username" />:
                        </span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm break-all">
                          @{customer.username}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <h3 className="flex items-center gap-2 mb-3 sm:mb-4 font-semibold text-gray-900 text-sm sm:text-base">
                      <Icon
                        icon={allIcons.solid.faEnvelope}
                        iconClassName="text-green-500"
                      />
                      <Translate content="Contact Information" />
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="Email" />:
                        </span>
                        <span className="font-medium text-gray-900 text-xs break-all">
                          {customer.email}
                        </span>
                      </div>
                      <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="Phone" />:
                        </span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">
                          {customer.phone || "Not provided"}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="md:col-span-2 xl:col-span-1 bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <h3 className="flex items-center gap-2 mb-3 sm:mb-4 font-semibold text-gray-900 text-sm sm:text-base">
                      <Icon
                        icon={allIcons.solid.faCalendar}
                        iconClassName="text-purple-500"
                      />
                      <Translate content="Account Details" />
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="Member Since" />:
                        </span>
                        <span className="font-medium text-gray-900 text-xs">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="Days Active" />:
                        </span>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">
                          {Math.floor(
                            (Date.now() - customer.createdAt) /
                              (1000 * 60 * 60 * 24)
                          )}
                        </span>
                      </div>
                      <div className="flex sm:flex-row flex-col sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-600 text-xs sm:text-sm capitalize">
                          <Translate content="Account ID" />:
                        </span>
                        <span className="font-mono font-medium text-gray-900 text-xs">
                          #{customer.username.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  className="flex sm:flex-row flex-col justify-center items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6 mx-auto px-2 sm:px-0 max-w-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                >
                  <Button
                    className={`px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white w-full sm:w-auto sm:flex-1 sm:max-w-xs capitalize transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base`}
                    onClick={() => setShowChangePasswordPopup(true)}
                  >
                    <Icon
                      icon={allIcons.solid.faKey}
                      iconClassName="text-white"
                    />
                    <span>
                      <Translate content="Change Password" />
                    </span>
                  </Button>
                  <Button
                    className={`px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gray-500 hover:bg-gray-600 rounded-lg text-white w-full sm:w-auto sm:flex-1 sm:max-w-xs capitalize transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base`}
                    onClick={() => setShowDeletePopup(true)}
                  >
                    <Icon
                      icon={allIcons.solid.faTrash}
                      iconClassName="text-white"
                    />
                    <span>
                      <Translate content="Delete Account" />
                    </span>
                  </Button>
                  <Button
                    className={`px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-red-500 hover:bg-red-600 rounded-lg text-white w-full sm:w-auto sm:flex-1 sm:max-w-xs capitalize transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base`}
                    onClick={() => setShowLogoutConfirmation(true)}
                  >
                    <Icon
                      icon={allIcons.solid.faSignOut}
                      iconClassName="text-white"
                    />
                    <span>
                      <Translate content="logout" />
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <EmptyComponent>
              <AnimatePresence mode="wait">
                <motion.h1
                  className="mb-2 font-bold text-gray-900 text-3xl text-center capitalize"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                >
                  <Translate
                    content={isLoginView ? "sign in" : "create account"}
                  />
                </motion.h1>
              </AnimatePresence>
              <motion.p
                className="mb-8 text-gray-600 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Translate content="Apply to become a commerce" />
              </motion.p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLoginView ? "login" : "signup"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2 mx-auto mt-6 max-w-md"
                >
                  {!isLoginView && (
                    <div className="flex items-center gap-2">
                      <motion.input
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        placeholder="Firstname"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        className="bg-gray-100 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full placeholder-gray-400"
                      />
                      <motion.input
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        placeholder="Lastname"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        className="bg-gray-100 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full placeholder-gray-400"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <motion.input
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-100 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full placeholder-gray-400"
                    />
                    {!isLoginView && checkingUsername?.status !== "idle" && (
                      <span
                        className={tw(
                          "top-1/2 right-4 absolute flex justify-center items-center text-xs text-white -translate-y-1/2 pointer-events-none transform",
                          checkingUsername?.status === "loading"
                            ? "text-sky-600"
                            : checkUsername?.status === "not-exists"
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        <Icon
                          iconClassName={tw(
                            checkingUsername?.status === "loading" &&
                              "animate-spin"
                          )}
                          icon={
                            checkingUsername?.status === "loading"
                              ? allIcons.solid.faRotate
                              : checkUsername?.status === "not-exists"
                              ? allIcons.solid.faCheck
                              : allIcons.solid.faXmark
                          }
                        />
                      </span>
                    )}
                  </div>
                  {!isLoginView && (
                    <motion.input
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-gray-100 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full placeholder-gray-400"
                    />
                  )}
                  {!isLoginView && (
                    <motion.input
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-100 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full placeholder-gray-400"
                    />
                  )}
                  <motion.input
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-100 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full placeholder-gray-400"
                  />
                  {!isLoginView && (
                    <motion.input
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-100 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full placeholder-gray-400"
                    />
                  )}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="relative flex items-center gap-2 bg-red-100 mb-4 px-4 py-3 border border-red-400 rounded-lg text-red-700 text-center"
                        role="alert"
                      >
                        <Icon icon={allIcons.solid.faWarning} />
                        <span className="block sm:inline">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-center items-center mt-4">
                    <Button
                      className={`px-6 py-3 rounded-lg text-white w-full capitalize`}
                      style={{ backgroundColor: BRAND_COLOR }}
                      onClick={onSubmit}
                    >
                      {(isLoginLoading || isSignupLoading) && (
                        <Icon
                          icon={allIcons.solid.faRefresh}
                          iconClassName="animate-spin"
                        />
                      )}
                      <Translate
                        content={isLoginView ? "login" : "create account"}
                      />
                    </Button>
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      className="text-gray-600 text-sm hover:underline capitalize"
                      onClick={() => {
                        setError(null);
                        setIsLoginView(!isLoginView);
                      }}
                    >
                      {isLoginView ? (
                        <Translate content="don't have an account? sign up" />
                      ) : (
                        <Translate content="already have an account? sign in" />
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 mx-auto mt-8 max-w-2xl">
                {showcaseImages
                  // .slice(0, isLoginView ? undefined : 3)
                  .map((src, idx) => (
                    <motion.div
                      key={idx}
                      className="group relative shadow rounded-lg overflow-hidden"
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.1 + idx * 0.2,
                      }}
                      whileHover={{ y: -4 }}
                    >
                      <img
                        src={src}
                        alt={`Commerce showcase ${idx + 1}`}
                        className="w-full h-28 md:h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src =
                            "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Commerce";
                        }}
                      />
                    </motion.div>
                  ))}
              </div>
            </EmptyComponent>
          )}
          {showDeletePopup && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
              <motion.div
                className="bg-white shadow-lg mx-4 p-4 sm:p-6 lg:p-8 rounded-lg w-full max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <h2 className="mb-3 sm:mb-4 font-bold text-lg sm:text-xl">
                  <Translate content="delete account" />
                </h2>
                <p className="mb-3 sm:mb-4 text-sm sm:text-base capitalize">
                  <Translate content="are you sure you want to delete your account? this action cannot be undone." />
                </p>
                <input
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="bg-gray-100 mb-3 sm:mb-4 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full text-sm sm:text-base placeholder-gray-400"
                />
                <div className="flex sm:flex-row flex-col justify-end gap-3 sm:gap-4">
                  <Button
                    className="bg-gray-200 hover:bg-gray-300 px-4 sm:px-6 py-3 rounded-lg w-full sm:w-auto text-gray-600 text-sm sm:text-base"
                    onClick={() => setShowDeletePopup(false)}
                  >
                    <Translate content="Cancel" />
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 px-4 sm:px-6 py-3 rounded-lg w-full sm:w-auto text-white text-sm sm:text-base"
                    onClick={handleDeleteAccount}
                  >
                    <Translate content="Delete" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
          {showChangePasswordPopup && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
              <motion.div
                className="bg-white shadow-lg mx-4 p-4 sm:p-6 lg:p-8 rounded-lg w-full max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <h2 className="mb-3 sm:mb-4 font-bold text-lg sm:text-xl">
                  <Translate content="change password" />
                </h2>
                <p className="mb-3 sm:mb-4 text-sm sm:text-base capitalize">
                  <Translate content="Please enter your old and new passwords." />
                </p>
                <input
                  type="password"
                  placeholder="Old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="bg-gray-100 mb-3 sm:mb-4 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full text-sm sm:text-base placeholder-gray-400"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-100 mb-3 sm:mb-4 p-3 border border-gray-300 focus:border-sky-500 border-solid rounded-full w-full text-sm sm:text-base placeholder-gray-400"
                />
                <div className="flex sm:flex-row flex-col justify-end gap-3 sm:gap-4">
                  <Button
                    className="bg-gray-200 hover:bg-gray-300 px-4 sm:px-6 py-3 rounded-lg w-full sm:w-auto text-gray-600 text-sm sm:text-base"
                    onClick={() => setShowChangePasswordPopup(false)}
                  >
                    <Translate content="Cancel" />
                  </Button>
                  <Button
                    className="flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 sm:px-6 py-3 rounded-lg w-full sm:w-auto text-white text-sm sm:text-base"
                    onClick={() => execAction("change-password")}
                  >
                    {isChangingPassword && (
                      <Icon
                        icon={allIcons.solid.faRefresh}
                        iconClassName="animate-spin"
                      />
                    )}
                    <Translate content="Change" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
          {showLogoutConfirmation && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
              <motion.div
                className="bg-white shadow-lg mx-4 p-4 sm:p-6 lg:p-8 rounded-lg w-full max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="text-center">
                  <motion.div
                    className="flex justify-center items-center bg-red-100 mx-auto mb-4 rounded-full w-12 h-12"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      icon={allIcons.solid.faSignOut}
                      iconClassName="text-red-600"
                    />
                  </motion.div>
                  <h2 className="mb-3 sm:mb-4 font-bold text-gray-900 text-lg sm:text-xl">
                    <Translate content="Confirm Logout" />
                  </h2>
                  <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
                    <Translate content="Are you sure you want to logout? You will need to sign in again to access your account." />
                  </p>
                  <div className="flex sm:flex-row flex-col justify-center gap-3 sm:gap-4">
                    <Button
                      className="bg-gray-200 hover:bg-gray-300 px-4 sm:px-6 py-3 rounded-lg w-full sm:w-auto text-gray-600 text-sm sm:text-base"
                      onClick={() => setShowLogoutConfirmation(false)}
                    >
                      <Translate content="Cancel" />
                    </Button>
                    <Button
                      className="flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 px-4 sm:px-6 py-3 rounded-lg w-full sm:w-auto text-white text-sm sm:text-base"
                      onClick={handleLogout}
                    >
                      <Icon
                        icon={allIcons.solid.faSignOut}
                        iconClassName="text-white"
                      />
                      <Translate content="Logout" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
