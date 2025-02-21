;#region FirstRegion
(def x 42)
;;#endregion

;#endregion Invalid end boundary
;#region Invalid start boundary

;;;;   #region Second Region  
(defn my-class []
    ;   #region    InnerRegion   
    (defn my-method [] nil)
    ;;   #endregion    ends InnerRegion  

    ;;   #region  
    (defn my-method2 [] nil)
    ;;#endregion  
)
;; #endregion

