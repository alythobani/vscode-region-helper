;#region FirstRegion
(def x 42)
;;#endregion

;;;;   #region SecondRegion  
(defn my-class []
    ;   #region    InnerRegion   
    (defn my-method [] nil)
    ;;   #endregion    ends InnerRegion  

    ;;   #region  
    (defn my-method2 [] nil)
    ;;#endregion  
)
;; #endregion

